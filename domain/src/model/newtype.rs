/// Emits the wrapper half of a validated string newtype: the declaration, the
/// derives, the transparent serde representation and the two accessors. The
/// leading `$(#[$meta:meta])*` carries each type's own doc comment through, so
/// the validation policy stays documented on the type it governs.
///
/// `parse` is deliberately *not* generated. Every one of these types validates
/// something different, with its own error strings and its own tests pinning
/// them, so each module writes its own `parse` in a plain `impl` block beside
/// the invocation.
///
/// `#[serde(transparent)]` is part of the contract rather than an incidental
/// derive: the wire format of all of these is the bare string.
macro_rules! string_newtype {
	($(#[$meta:meta])* $name:ident) => {
		$(#[$meta])*
		#[derive(Clone, Debug, Eq, PartialEq, ::serde::Deserialize, ::serde::Serialize)]
		#[serde(transparent)]
		pub struct $name(String);

		impl $name {
			pub fn as_str(&self) -> &str {
				&self.0
			}

			pub fn into_string(self) -> String {
				self.0
			}
		}
	};
}

pub(crate) use string_newtype;
