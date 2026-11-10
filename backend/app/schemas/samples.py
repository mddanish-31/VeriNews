from pydantic import BaseModel, Field


class SampleExcerpt(BaseModel):
    """Pre-curated news excerpt for testing and demonstration."""

    id: str = Field(..., description="Unique sample identifier.")
    language: str = Field(..., description="Language code ('en' or 'hi').")
    language_name: str = Field(..., description="Human-readable language name.")
    category: str = Field(..., description="Content category or reporting style.")
    title: str = Field(..., description="Headline or title of the sample.")
    text: str = Field(..., description="News article body excerpt.")
    is_illustrative: bool = Field(
        default=True,
        description="Explicit flag confirming this excerpt is for illustrative testing and has no model prediction.",
    )
    disclaimer: str = Field(
        default="Illustrative sample excerpt only. Not evaluated by an active model.",
        description="Responsible use disclaimer attached to the excerpt.",
    )

