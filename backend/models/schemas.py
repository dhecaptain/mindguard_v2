from pydantic import BaseModel, Field, field_validator
from typing import Optional


class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)

    @field_validator("text")
    @classmethod
    def text_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("text must not be blank")
        return v


class TextAnalysisResponse(BaseModel):
    prob: float
    latency_ms: float
    analytics: dict


class PlatformRequest(BaseModel):
    username: str = ""
    handle: str = ""
    instance: str = Field(default="mastodon.social", max_length=253)
    password: str = ""
    channel_url: str = ""
    video_url: str = ""
    profile_url: str = ""
    api_key: str = ""
    min_risk: float = Field(default=0.0, ge=0.0, le=1.0)
    n_show: int = Field(default=20, gt=0, le=500)


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254)
    password: str = Field(..., min_length=1)


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: str = Field(..., min_length=3, max_length=254)
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    role: str = "student"
    dob: Optional[str] = None
    parent_email: Optional[str] = None
    referred_by: Optional[str] = None


class UserResponse(BaseModel):
    email: str
    name: str
    role: str
    role_type: str
    referral_code: str
