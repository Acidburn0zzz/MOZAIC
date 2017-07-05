#[derive(Serialize, Deserialize)]
struct Expedition {
    ship_count: u64,
    origin: String,
    destination: String,
    owner: String,
    turns_remaining: i64,
}

#[derive(Serialize, Deserialize)]
struct Planet {
    ship_count: u64,
    x: f64,
    y: f64,
    owner: String,
    name: String,
}

#[derive(Serialize, Deserialize)]
struct State {
    players: Vec<String>,
    planets: Vec<Planet>,
    expeditions: Vec<Expedition>,
}


pub type Command = Option<Move>

pub struct Move {
    pub origin: String,
    pub destination: String,
    pub ship_count: u64,
}
