use std::io;
use std::sync::{Arc, Mutex};
use sodiumoxide::crypto::sign::{PublicKey, SecretKey};
use reactors::{WireEvent, EventHandler};
use std::marker::PhantomData;

use network::lib::ConnectionHandle;
use network::lib::channel::Channel;
use network::lib::crypto::SessionKeys;
use super::connection_table::ConnectionTable;


// TODO: this is all really ugly and unhygienic
// please fix and wash hands

pub trait Router {
    fn route(&self, &[u8]) -> Result<Routing<Self>, io::Error>;
    fn unregister(&mut self, usize);
}


// The reason that we return a 'creator' instead of just directly creating
// a connection is that a connecting transport is not authenticated when routing
// happens. This is, of course, because we need to know who we have to
// authenticate before we can actually do so. 
// Suppose an intruder tries to open a new connection. If the connection would
// be opened right away, we would be stuck with an open connection that nobody
// can connect to (because the intruder cannot authenticate).
// With this 'creator', we can delay the creation of a connection until the
// handshake has been completed.
pub enum Routing<R>
    where R: Router + ?Sized
{
    Connect(usize),
    CreateConnection {
        public_key: PublicKey,
        creator: ConnectionCreator<R>,
    }
}

pub struct ConnectionCreator<R: ?Sized> {
    spawner: Box<ConnectionSpawner<R> + Send>,
}

impl<R> ConnectionCreator<R>
    where R: Send + 'static
{
    pub fn new<H, F>(func: F) -> Self
        where H: EventHandler<Output = io::Result<WireEvent>>,
              F: FnMut(ConnectionHandle, &mut R) -> H + Send + 'static,
              H: Send + 'static,

    {
        ConnectionCreator {
            spawner: Box::new(
                CreateConnectionWrapper::new(func)
            )
        }
    }

    pub fn create_connection(
        &mut self,
        public_key: PublicKey,
        conn_table: &mut ConnectionTable,
        router: &mut R,
    ) -> ConnectionHandle
    {
        self.spawner.create_connection(public_key, conn_table, router)
    }

}

trait ConnectionSpawner<R>
    where R: ?Sized
{
    fn create_connection(
        &mut self,
        public_key: PublicKey,
        conn_table: &mut ConnectionTable,
        router: &mut R
    ) -> ConnectionHandle;
}

pub struct CreateConnectionWrapper<R: ?Sized, H, F>
    where H: EventHandler<Output = io::Result<WireEvent>>,
          F: FnMut(ConnectionHandle, &mut R) -> H
{
    creator: F,
    phantom_r: PhantomData<R>,
    phantom_h: PhantomData<H>,
}

impl<R, H, F> CreateConnectionWrapper<R, H, F>
    where H: EventHandler<Output = io::Result<WireEvent>>,
          F: FnMut(ConnectionHandle, &mut R) -> H + 'static,
          H: Send + 'static
{
    pub fn new(func: F) -> Self {
        CreateConnectionWrapper {
            creator: func,
            phantom_r: PhantomData,
            phantom_h: PhantomData,
        }
    }
}


impl<R, H, F> ConnectionSpawner<R> for CreateConnectionWrapper<R, H, F>
    where H: EventHandler<Output = io::Result<WireEvent>>,
          F: FnMut(ConnectionHandle, &mut R) -> H,
          R: Send + 'static,
          H: Send + 'static
{
    fn create_connection(
        &mut self,
        public_key: PublicKey,
        conn_table: &mut ConnectionTable,
        router: &mut R
    ) -> ConnectionHandle
    {
        conn_table.create(public_key, |handle| {
            (self.creator)(handle, router)
        })
    }
}





pub struct ConnectionRouter<R: Router> {
    pub router: Arc<Mutex<R>>,
    pub connection_table: Arc<Mutex<ConnectionTable>>,
    pub secret_key: SecretKey,
}

impl<R: Router> Clone for ConnectionRouter<R> {
    fn clone(&self) -> Self {
        ConnectionRouter {
            router: self.router.clone(),
            connection_table: self.connection_table.clone(),
            secret_key: self.secret_key.clone(),
        }
    }
}

impl<R: Router> ConnectionRouter<R> {
    pub fn route(&mut self, msg: &[u8])
        -> Result<ConnectionRouting<R>, io::Error>
    {
        let router = self.router.lock().unwrap();
        let routing = try!(router.route(msg));
        let conn_routing = match routing {
            Routing::Connect(conn_id) => {
                let mut table = self.connection_table.lock().unwrap();
                ConnectionRouting {
                    public_key: table.get(conn_id).unwrap().public_key.clone(),
                    router: self.clone(),
                    target: RoutingTarget::Connection(conn_id),
                }
            }
            Routing::CreateConnection { public_key, creator } => {
                ConnectionRouting {
                    public_key,
                    router: self.clone(),
                    target: RoutingTarget::NewConnection(creator),
                }
            }
        };
        return Ok(conn_routing);
    }
}

pub struct ConnectionRouting<R>
    where R: Router
{
    public_key: PublicKey,
    router: ConnectionRouter<R>,
    target: RoutingTarget<R>,
}

enum RoutingTarget<R> {
    Connection(usize),
    NewConnection(ConnectionCreator<R>),
}

impl<R> ConnectionRouting<R>
    where R: Router
{
    pub fn public_key<'a>(&'a self) -> &'a PublicKey {
        &self.public_key
    }
}


impl<R> ConnectionRouting<R>
    where R: Router + 'static + Send
{
    pub fn connect(self, channel: Channel, keys: SessionKeys) {
        let mut conn_table = self.router.connection_table.lock().unwrap();

        match self.target {
            RoutingTarget::Connection(conn_id) => {
                conn_table.get_mut(conn_id)
                    .unwrap()
                    .handle
                    .connect(channel, keys);
            }
            RoutingTarget::NewConnection(mut creator) => {
                let mut router = self.router.router.lock().unwrap();
                creator.create_connection(
                    self.public_key,
                    &mut conn_table,
                    &mut router,
                ).connect(channel, keys);
            }
        }
    }
}