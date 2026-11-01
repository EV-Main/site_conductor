//! Driven-side ports. These traits are the seams the application layer depends
//! on; concrete adapters live under `infrastructure`. Domain models and errors
//! themselves come from the `domain` workspace crate, not here.

pub mod port;
