use std::collections::HashMap;

use super::connection_handler::{ConnectionHandler, ConnectionHandle};
use reactors::{WireEvent, EventHandler};
use std::io;
use tokio;

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq)]
pub struct ClientId(u32);

impl ClientId {
    pub fn new(num: u32) -> ClientId {
        ClientId(num)
    }

    pub fn as_u32(&self) -> u32 {
        let ClientId(num) = *self;
        return num;
    }
}

#[derive(Clone)]
pub struct ConnectionData {
    pub connection_id: usize,
    pub handle: ConnectionHandle,
    pub public_key: Vec<u8>,
}

pub struct ConnectionTable {
    id_counter: usize,
    connections: HashMap<usize, ConnectionData>,
}

impl ConnectionTable {
    pub fn new() -> Self {
        ConnectionTable {
            id_counter: 0,
            connections: HashMap::new(),
        }
    }

    pub fn create<H, F>(&mut self, public_key: Vec<u8>, creator: F)
        -> usize
        where F: FnOnce(ConnectionHandle) -> H,
              H: EventHandler<Output = io::Result<WireEvent>>,
              H: Send + 'static
    {
        let connection_id = self.id_counter;
        self.id_counter += 1;

        let (handle, handler) = ConnectionHandler::create(connection_id, creator);
        tokio::spawn(handler);


        self.connections.insert(connection_id, ConnectionData {
            connection_id,
            handle: handle.clone(),
            public_key,
        });
        return connection_id;
    }

    pub fn get<'a>(&'a mut self, connection_id: usize)
        -> Option<&'a ConnectionData>
    {
        self.connections.get(&connection_id)
    }

    pub fn remove(&mut self, connection_id: usize) {
        self.connections.remove(&connection_id);
    }
}