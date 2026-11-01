#![feature(default_field_values)]
//! Backend library crate.
//!
//! Exposes the layered modules so both the server binary (`main.rs`) and the
//! spec-dump binary (`bin/gen_openapi.rs`) share one source of truth.
//!
//! Dependency direction (hexagonal):
//!   api ─▶ application ─▶ `domain` crate ◀─ infrastructure
//! `crate::domain` is ports only; models and errors live in the `domain` workspace crate.

pub mod api;
pub mod application;
pub mod config;
pub mod domain;
pub mod infrastructure;
