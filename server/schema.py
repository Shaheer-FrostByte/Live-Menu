from pydantic import BaseModel, Field, field_validator
from uuid import UUID

class Category(BaseModel):
    C_id: UUID
    C_name: str = Field(..., min_length=2, max_length=50)
    C_avail: bool

    @field_validator("C_name")
    @classmethod
    def strip_whitespaces_and_validates(cls, name:str) -> str:
        name = name.strip()

        if len(name) < 2:
            raise ValueError("Name must be at least 2 characters without counting spaces.")
        else:
            return name

class CreateUpdateCategory(BaseModel):
    C_name: str = Field(..., min_length=2, max_length=50)
    C_avail: bool = True

    @field_validator("C_name")
    @classmethod
    def strip_whitespaces_and_validates(cls, name:str) -> str:
        name = name.strip()

        if len(name) < 2:
            raise ValueError("Name must be at least 2 characters without counting spaces.")
        else:
            return name


class Item(BaseModel):
    I_id: UUID
    I_name: str = Field(..., min_length=2, max_length=50)
    I_price: int = Field(..., gt=0, le=50000)
    I_avail: bool
    cat_id: UUID

    @field_validator("I_name")
    @classmethod
    def strip_whitespaces_and_validates(cls, name:str) -> str:
        name = name.strip()

        if len(name) < 2:
            raise ValueError("Name must be at least 2 characters without counting spaces.")
        else:
            return name



class CreateItem(BaseModel):
    I_name: str = Field(..., min_length=2, max_length=50)
    I_price: int = Field(..., gt=0, le=50000)
    I_avail: bool = True
    cat_id: UUID

    @field_validator("I_name")
    @classmethod
    def strip_whitespaces_and_validates(cls, name:str) -> str:
        name = name.strip()

        if len(name) < 2:
            raise ValueError("Name must be at least 2 characters without counting spaces.")
        else:
            return name


class UpdateItem(BaseModel):
    I_name: str = Field(..., min_length=2, max_length=50)
    I_price: int = Field(..., gt=0, le=50000)
    I_avail: bool = True
## Missing UUID because updating an item keeps it in the same category.
## If an item's category needs to be changed, then it has to be deleted and created in the corrected category.

    @field_validator("I_name")
    @classmethod
    def strip_whitespaces_and_validates(cls, name:str) -> str:
        name = name.strip()

        if len(name) < 2:
            raise ValueError("Name must be at least 2 characters without counting spaces.")
        else:
            return name

