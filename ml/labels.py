"""Explicit label mapping and semantics validation for ML datasets.

Strict Policy:
- NEVER assume 0 means Fake or 1 means Real.
- Require documented label semantics (source_reference) before accepting a dataset.
- Reject ambiguous, conflicting, or non-binary mappings.
"""

from typing import Any, Dict, Optional, Set

from .schemas import CanonicalLabel


class LabelMappingError(Exception):
    """Raised when label mapping configuration is invalid or ambiguous."""

    pass


class LabelMapping:
    """Explicit, documented mapping between raw dataset labels and CanonicalLabel values.

    Datasets employ wildly divergent and inverted conventions:
    - WELFake: 1 = Fake, 0 = Real
    - ISOT: "Fake", "True"
    - Other corpora: 1 = Credible, 0 = Unreliable

    This class mandates that every mapping documents its provenance reference
    and enforces unambiguous binary assignment.
    """

    def __init__(
        self,
        raw_to_canonical: Dict[Any, CanonicalLabel],
        source_description: str,
        documentation_reference: str,
    ):
        """Initialize an explicit LabelMapping.

        Args:
            raw_to_canonical: Dict mapping raw label values (e.g. 0, 1, 'fake') to CanonicalLabel.
            source_description: Description of the dataset label semantics.
            documentation_reference: Authoritative paper DOI, Zenodo link, or datasheet citation.

        Raises:
            LabelMappingError: If mapping is empty, ambiguous, or lacks documentation.
        """
        if not documentation_reference or not documentation_reference.strip():
            raise LabelMappingError(
                "Documented label semantics are strictly required before accepting a dataset. "
                "Provide an authoritative documentation reference (paper citation, DOI, or official datasheet)."
            )

        if not source_description or not source_description.strip():
            raise LabelMappingError("A descriptive source_description of raw label semantics is required.")

        if not raw_to_canonical:
            raise LabelMappingError("Label mapping cannot be empty.")

        # Normalize string keys for case-insensitive lookup while preserving numeric/bool keys
        self._mapping: Dict[Any, CanonicalLabel] = {}
        for raw_val, canonical_val in raw_to_canonical.items():
            if not isinstance(canonical_val, CanonicalLabel):
                try:
                    canonical_val = CanonicalLabel(canonical_val)
                except ValueError as err:
                    raise LabelMappingError(
                        f"Target value '{canonical_val}' is not a valid CanonicalLabel "
                        f"({[c.value for c in CanonicalLabel]})."
                    ) from err

            # Key normalization: store both raw and lowercase string representation for strings
            self._mapping[raw_val] = canonical_val
            if isinstance(raw_val, str):
                self._mapping[raw_val.strip().lower()] = canonical_val

        # Validate that both classes are present (binary classification mandate)
        mapped_targets: Set[CanonicalLabel] = set(self._mapping.values())
        if CanonicalLabel.CREDIBLE not in mapped_targets or CanonicalLabel.UNRELIABLE not in mapped_targets:
            raise LabelMappingError(
                f"Binary classification requires mappings for both {CanonicalLabel.CREDIBLE.value} "
                f"and {CanonicalLabel.UNRELIABLE.value}. Found: {[c.value for c in mapped_targets]}"
            )

        self.source_description = source_description
        self.documentation_reference = documentation_reference

    def map_label(self, raw_label: Any) -> CanonicalLabel:
        """Map a raw dataset label to CanonicalLabel.

        Args:
            raw_label: Raw value from dataset row (string, int, bool, etc.).

        Returns:
            CanonicalLabel (CREDIBLE or UNRELIABLE).

        Raises:
            LabelMappingError: If raw label is unknown or cannot be mapped.
        """
        if raw_label is None:
            raise LabelMappingError("Cannot map None label.")

        # Direct key match
        if raw_label in self._mapping:
            return self._mapping[raw_label]

        # Case-insensitive string match
        if isinstance(raw_label, str):
            norm = raw_label.strip().lower()
            if norm in self._mapping:
                return self._mapping[norm]

        # String representation of numeric value match (e.g. "0" matching int 0 or vice versa)
        try:
            int_val = int(raw_label)
            if int_val in self._mapping:
                return self._mapping[int_val]
        except (ValueError, TypeError):
            pass

        str_val = str(raw_label).strip()
        if str_val in self._mapping:
            return self._mapping[str_val]

        raise LabelMappingError(
            f"Unmapped raw label value: '{raw_label}' (type: {type(raw_label).__name__}). "
            f"Configured valid keys: {list(self._mapping.keys())}"
        )

    def is_mappable(self, raw_label: Any) -> bool:
        """Check whether a raw label can be mapped without raising an exception."""
        try:
            self.map_label(raw_label)
            return True
        except LabelMappingError:
            return False

    def __repr__(self) -> str:
        return (
            f"<LabelMapping source='{self.source_description[:30]}...' "
            f"ref='{self.documentation_reference[:30]}...'>"
        )

