// ═══════════════════════════════════════════════════════════════════════════
// WASM SEARCH ENGINE — Core Search logic and track index in Rust.
// Compiles to: public/search.wasm
// ═══════════════════════════════════════════════════════════════════════════

static mut INPUT_BUFFER: [u8; 1000] = [0; 1000];
static mut RESULT_BUFFER: [u8; 120000] = [0; 120000];
static mut RESULT_LEN: usize = 0;

struct Track {
    title: &'static str,
    artist: &'static str,
    album: &'static str,
    year: u32,
    duration: &'static str,
    valence: f32,
    energy: f32,
}

// Predefined real tracks from Borja Moskv's discography/site
static BASE_TRACKS: &[Track] = &[
    Track { title: "NO SLEEP IN MY CITY", artist: "Borja Moskv", album: "Exergia-Ω", year: 2026, duration: "4:32", valence: 0.12, energy: 0.85 },
    Track { title: "HIPOTENUSAS ILEGALES", artist: "Borja Moskv", album: "Exergia-Ω", year: 2026, duration: "5:12", valence: 0.25, energy: 0.72 },
    Track { title: "PATADAS", artist: "Borja Moskv", album: "Exergia-Ω", year: 2026, duration: "3:45", valence: 0.08, energy: 0.92 },
    Track { title: "COHERENCIA RARA 42", artist: "Borja Moskv", album: "Exergia-Ω", year: 2026, duration: "6:02", valence: 0.42, energy: 0.68 },
    Track { title: "LA TIBIA", artist: "Borja Moskv", album: "The Chronicles of Diegoi", year: 2026, duration: "7:15", valence: 0.18, energy: 0.54 },
    Track { title: "ECOS DEL COSMOS", artist: "Borja Moskv", album: "Ecos del Cosmos", year: 2025, duration: "8:40", valence: 0.65, energy: 0.30 },
    Track { title: "GLITCH IN THE MIRROR", artist: "Borja Moskv", album: "Glitch in the Mirror", year: 2025, duration: "4:11", valence: 0.35, energy: 0.78 },
    Track { title: "LES BUKO", artist: "Borja Moskv", album: "Les Buko", year: 2025, duration: "5:48", valence: 0.50, energy: 0.82 },
    Track { title: "32 Y PICO", artist: "Borja Moskv", album: "Electronic compilations", year: 2025, duration: "3:20", valence: 0.55, energy: 0.90 },
    Track { title: "4 DROGAS", artist: "Borja Moskv", album: "Techno Sessions", year: 2025, duration: "6:45", valence: 0.15, energy: 0.95 },
    Track { title: "ANTES DE LAS GUERRAS", artist: "Borja Moskv", album: "Antes de las Guerras", year: 2025, duration: "7:02", valence: 0.70, energy: 0.22 },
    Track { title: "EN EL PRISMA DEL XOKAS", artist: "Borja Moskv", album: "Prismas", year: 2025, duration: "4:05", valence: 0.20, energy: 0.88 },
    Track { title: "BUILDING YOUR OWN UNIVERSE", artist: "Borja Moskv", album: "Substack Shorts", year: 2025, duration: "5:30", valence: 0.40, energy: 0.60 },
    Track { title: "ALGORITHMS VS HUMAN ATTENTION", artist: "Borja Moskv", album: "Substack Shorts", year: 2025, duration: "4:50", valence: 0.30, energy: 0.70 },
    Track { title: "CON LA PUNTA DEL CIPOTE", artist: "Borja Moskv", album: "Substack Shorts", year: 2025, duration: "3:10", valence: 0.10, energy: 0.95 },
    Track { title: "EL ARTE NO TE DEBE NADA", artist: "Borja Moskv", album: "Substack Shorts", year: 2025, duration: "5:15", valence: 0.45, energy: 0.50 },
    Track { title: "JAR TO THE SYSTEM", artist: "Borja Moskv", album: "Jar System", year: 2025, duration: "4:22", valence: 0.28, energy: 0.80 },
    Track { title: "METAFASHION", artist: "Borja Moskv", album: "Metafashion", year: 2025, duration: "5:05", valence: 0.60, energy: 0.75 },
    Track { title: "BLAC", artist: "Borja Moskv", album: "Blac", year: 2025, duration: "6:12", valence: 0.32, energy: 0.85 },
    Track { title: "EL CUY DEL ALTIPLANO", artist: "Borja Moskv", album: "Andina Drone", year: 2024, duration: "7:40", valence: 0.48, energy: 0.35 },
    Track { title: "JUGAR LA BRISCA CON AMAVISCA", artist: "Borja Moskv", album: "Hard Bachata Vol 1", year: 2024, duration: "3:58", valence: 0.80, energy: 0.90 },
    Track { title: "LAMENTO BOLIVARIANO", artist: "Borja Moskv", album: "Andina Drone", year: 2024, duration: "8:10", valence: 0.30, energy: 0.28 },
    Track { title: "ME CAIGO Y ME LEVANTO", artist: "Borja Moskv", album: "Parkour compilation", year: 2024, duration: "4:15", valence: 0.62, energy: 0.84 },
    Track { title: "COCODRILO COJONES", artist: "Borja Moskv", album: "Hard Bachata Vol 1", year: 2024, duration: "3:40", valence: 0.85, energy: 0.92 },
    Track { title: "NEURAL TRANSFER", artist: "Borja Moskv", album: "Neural Transfer", year: 2025, duration: "5:22", valence: 0.38, energy: 0.81 },
    Track { title: "VOID CASCADE", artist: "Borja Moskv", album: "Void Cascade", year: 2025, duration: "9:05", valence: 0.10, energy: 0.25 },
    Track { title: "PIENSO LUEGO IMPROVISO", artist: "Borja Moskv", album: "Improvisaciones", year: 2025, duration: "6:30", valence: 0.45, energy: 0.75 },
];

#[no_mangle]
pub extern "C" fn get_input_ptr() -> *mut u8 {
    unsafe { INPUT_BUFFER.as_mut_ptr() }
}

#[no_mangle]
pub extern "C" fn get_result_ptr() -> *const u8 {
    unsafe { RESULT_BUFFER.as_ptr() }
}

#[no_mangle]
pub extern "C" fn get_result_len() -> usize {
    unsafe { RESULT_LEN }
}

// Custom simple string matcher: checks if pattern (lowercase) is a substring of source (converted to lowercase)
fn matches_query(source: &str, query: &str) -> bool {
    if query.is_empty() {
        return true;
    }
    
    // We do a simple case-insensitive substring search without allocating where possible.
    // Convert source to lowercase and check.
    // Since we compile to WASM without standard library unicode-folding, a simple ASCII case folding is fine.
    let source_len = source.len();
    let query_len = query.len();
    if source_len < query_len {
        return false;
    }
    
    for i in 0..=(source_len - query_len) {
        let mut matched = true;
        for j in 0..query_len {
            let s_char = source.as_bytes()[i + j];
            let q_char = query.as_bytes()[j];
            
            let s_lower = if s_char >= b'A' && s_char <= b'Z' { s_char + 32 } else { s_char };
            let q_lower = if q_char >= b'A' && q_char <= b'Z' { q_char + 32 } else { q_char };
            
            if s_lower != q_lower {
                matched = false;
                break;
            }
        }
        if matched {
            return true;
        }
    }
    false
}

struct ParsedQuery {
    text: String,
    energy_min: Option<f32>,
    energy_max: Option<f32>,
    valence_min: Option<f32>,
    valence_max: Option<f32>,
    year_eq: Option<u32>,
    year_min: Option<u32>,
    year_max: Option<u32>,
}

fn parse_query(query: &str) -> ParsedQuery {
    let mut text_parts = Vec::new();
    let mut energy_min = None;
    let mut energy_max = None;
    let mut valence_min = None;
    let mut valence_max = None;
    let mut year_eq = None;
    let mut year_min = None;
    let mut year_max = None;

    for word in query.split_whitespace() {
        if word.starts_with("energy>") {
            if let Ok(val) = word[7..].parse::<f32>() {
                energy_min = Some(val);
            }
        } else if word.starts_with("energy<") {
            if let Ok(val) = word[7..].parse::<f32>() {
                energy_max = Some(val);
            }
        } else if word.starts_with("valence>") {
            if let Ok(val) = word[8..].parse::<f32>() {
                valence_min = Some(val);
            }
        } else if word.starts_with("valence<") {
            if let Ok(val) = word[8..].parse::<f32>() {
                valence_max = Some(val);
            }
        } else if word.starts_with("year:") {
            if let Ok(val) = word[5..].parse::<u32>() {
                year_eq = Some(val);
            }
        } else if word.starts_with("year>") {
            if let Ok(val) = word[5..].parse::<u32>() {
                year_min = Some(val);
            }
        } else if word.starts_with("year<") {
            if let Ok(val) = word[5..].parse::<u32>() {
                year_max = Some(val);
            }
        } else {
            text_parts.push(word);
        }
    }

    ParsedQuery {
        text: text_parts.join(" "),
        energy_min,
        energy_max,
        valence_min,
        valence_max,
        year_eq,
        year_min,
        year_max,
    }
}

#[no_mangle]
pub extern "C" fn search(query_ptr: *const u8, query_len: usize) {
    // 1. Read query string from input buffer
    let query_slice = unsafe { std::slice::from_raw_parts(query_ptr, query_len) };
    let query = match std::str::from_utf8(query_slice) {
        Ok(s) => s,
        Err(_) => "",
    };

    let parsed = parse_query(query);

    // 2. Perform search and generate results
    let total_archive_size = 1918;
    let base_count = BASE_TRACKS.len();
    
    // Helper arrays to generate realistic simulated tracks deterministically
    let verbs = &["PULSO", "ECO", "RITMO", "GLITCH", "FACTOR", "VECTOR", "BLOQUE", "CANAL", "LIMIT", "ESTADO", "ESTIMULO", "FILTRO", "RUIDO", "OSCILADOR"];
    let nouns = &["SILICIO", "DEBILIDAD", "ENTROPIA", "EXERGIA", "SINTESIS", "PUERTO", "BILBAO", "MODULAR", "BINAURAL", "ESTOCASTICO", "DETERMINISTA", "COGNITIVO", "TERMODINAMICO", "ANALOGICO"];
    let artists = &["Borja Moskv", "Ritxie Hawting", "Sovereign Agent", "K-0 Swarm", "Marvin the Synth", "Granger Node"];
    let albums = &["Exergia-Ω", "Autodidact", "Cortex-Persist", "Termodinamica Vol 1", "Bilbao Minimal", "Fahrenheit Mesh", "Autopoiesis"];
    let durations = &["3:42", "4:15", "5:02", "2:58", "6:12", "4:45", "3:12", "5:30", "7:05"];

    let mut result_json = String::new();
    result_json.push('[');
    
    let mut matches_count = 0;
    
    for idx in 0..total_archive_size {
        // Limit max results to 35 to prevent blowing up the result buffer size (120KB)
        if matches_count >= 35 {
            break;
        }

        let mut gen_title = String::new();
        
        let (title, artist, album, year, duration, valence, energy) = if idx < base_count {
            let t = &BASE_TRACKS[idx];
            (t.title, t.artist, t.album, t.year, t.duration, t.valence, t.energy)
        } else {
            let v_idx = (idx * 3) % verbs.len();
            let n_idx = (idx * 7) % nouns.len();
            let art_idx = (idx * 11) % artists.len();
            let alb_idx = (idx * 13) % albums.len();
            let dur_idx = (idx * 17) % durations.len();
            
            let roman = match idx % 5 {
                0 => "I",
                1 => "II",
                2 => "III",
                3 => "IV",
                _ => "V",
            };
            
            gen_title = format!("{} {} {}", verbs[v_idx], nouns[n_idx], roman);
            
            let gen_artist = artists[art_idx];
            let gen_album = albums[alb_idx];
            let gen_year = 2020 + (idx as u32 % 7);
            let gen_duration = durations[dur_idx];
            
            let gen_valence = ((idx * 13) % 100) as f32 / 100.0;
            let gen_energy = ((idx * 23) % 100) as f32 / 100.0;
            
            (gen_title.as_str(), gen_artist, gen_album, gen_year, gen_duration, gen_valence, gen_energy)
        };
        
        // Apply structured filter checks
        let mut matches = true;

        if let Some(min) = parsed.energy_min {
            if energy <= min { matches = false; }
        }
        if let Some(max) = parsed.energy_max {
            if energy >= max { matches = false; }
        }
        if let Some(min) = parsed.valence_min {
            if valence <= min { matches = false; }
        }
        if let Some(max) = parsed.valence_max {
            if valence >= max { matches = false; }
        }
        if let Some(eq) = parsed.year_eq {
            if year != eq { matches = false; }
        }
        if let Some(min) = parsed.year_min {
            if year <= min { matches = false; }
        }
        if let Some(max) = parsed.year_max {
            if year >= max { matches = false; }
        }

        // Apply text query check if text is specified
        if matches && !parsed.text.is_empty() {
            if !matches_query(title, &parsed.text) &&
               !matches_query(artist, &parsed.text) &&
               !matches_query(album, &parsed.text) {
                matches = false;
            }
        }
        
        if matches {
            if matches_count > 0 {
                result_json.push(',');
            }
            
            let item_str = format!(
                "{{\"title\":\"{}\",\"artist\":\"{}\",\"album\":\"{}\",\"year\":{},\"duration\":\"{}\",\"valence\":{:.2},\"energy\":{:.2}}}",
                title, artist, album, year, duration, valence, energy
            );
            
            result_json.push_str(&item_str);
            matches_count += 1;
        }
    }
    
    result_json.push(']');
    
    // 3. Write result bytes to RESULT_BUFFER
    let result_bytes = result_json.as_bytes();
    let write_len = std::cmp::min(result_bytes.len(), unsafe { RESULT_BUFFER.len() });
    
    unsafe {
        std::slice::from_raw_parts_mut(RESULT_BUFFER.as_mut_ptr(), write_len)
            .copy_from_slice(&result_bytes[..write_len]);
        RESULT_LEN = write_len;
    }
}
