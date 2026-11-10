"""Unit tests for explicit label mapping and semantics validation."""

import pytest

from ml.labels import LabelMapping, LabelMappingError
from ml.schemas import CanonicalLabel


def test_valid_label_mapping_with_documentation():
    """Verify that a documented label mapping initializes and maps values correctly."""
    mapping = LabelMapping(
        raw_to_canonical={
            1: CanonicalLabel.CREDIBLE,
            0: CanonicalLabel.UNRELIABLE,
        },
        source_description="Synthetic baseline test dataset semantics",
        documentation_reference="https://doi.org/10.1000/182",
    )

    assert mapping.map_label(1) == CanonicalLabel.CREDIBLE
    assert mapping.map_label(0) == CanonicalLabel.UNRELIABLE
    assert mapping.map_label("1") == CanonicalLabel.CREDIBLE
    assert mapping.map_label("0") == CanonicalLabel.UNRELIABLE
    assert mapping.is_mappable(1) is True
    assert mapping.is_mappable(0) is True
    assert mapping.is_mappable(999) is False


def test_inverted_label_mapping_supported_when_documented():
    """Verify that inverted conventions (e.g., 1=Unreliable, 0=Credible) work without default assumption."""
    inverted_mapping = LabelMapping(
        raw_to_canonical={
            1: CanonicalLabel.UNRELIABLE,
            0: CanonicalLabel.CREDIBLE,
        },
        source_description="Inverted convention corpus",
        documentation_reference="Dataset documentation reference XYZ-2024",
    )

    # Must follow explicit mapping, NOT an assumed default
    assert inverted_mapping.map_label(1) == CanonicalLabel.UNRELIABLE
    assert inverted_mapping.map_label(0) == CanonicalLabel.CREDIBLE


def test_missing_documentation_reference_rejected():
    """Verify that creating a mapping without documentation reference is rejected."""
    with pytest.raises(LabelMappingError, match="Documented label semantics are strictly required"):
        LabelMapping(
            raw_to_canonical={
                "real": CanonicalLabel.CREDIBLE,
                "fake": CanonicalLabel.UNRELIABLE,
            },
            source_description="Missing doc reference test",
            documentation_reference="",
        )


def test_missing_source_description_rejected():
    """Verify that creating a mapping without source description is rejected."""
    with pytest.raises(LabelMappingError, match="A descriptive source_description"):
        LabelMapping(
            raw_to_canonical={
                "real": CanonicalLabel.CREDIBLE,
                "fake": CanonicalLabel.UNRELIABLE,
            },
            source_description="",
            documentation_reference="https://doi.org/10.1000/182",
        )


def test_non_binary_mapping_rejected():
    """Verify that a mapping that does not map both binary classes is rejected."""
    with pytest.raises(LabelMappingError, match="Binary classification requires mappings for both"):
        LabelMapping(
            raw_to_canonical={
                1: CanonicalLabel.CREDIBLE,
                # Missing UNRELIABLE mapping
            },
            source_description="Incomplete mapping",
            documentation_reference="Ref-123",
        )


def test_string_case_insensitivity():
    """Verify case-insensitive string matching."""
    mapping = LabelMapping(
        raw_to_canonical={
            "CREDIBLE": CanonicalLabel.CREDIBLE,
            "UNRELIABLE": CanonicalLabel.UNRELIABLE,
        },
        source_description="String label corpus",
        documentation_reference="Ref-456",
    )

    assert mapping.map_label("credible") == CanonicalLabel.CREDIBLE
    assert mapping.map_label("CREDIBLE") == CanonicalLabel.CREDIBLE
    assert mapping.map_label("  unreliable  ") == CanonicalLabel.UNRELIABLE


def test_unmapped_label_raises_error():
    """Verify that an unknown or unmapped label raises a clear LabelMappingError."""
    mapping = LabelMapping(
        raw_to_canonical={
            1: CanonicalLabel.CREDIBLE,
            0: CanonicalLabel.UNRELIABLE,
        },
        source_description="Strict mapping test",
        documentation_reference="Ref-789",
    )

    with pytest.raises(LabelMappingError, match="Unmapped raw label value"):
        mapping.map_label("ambiguous_val")

    with pytest.raises(LabelMappingError, match="Cannot map None label"):
        mapping.map_label(None)

