from pydantic import BaseModel, Field
from uuid import UUID

class Category(BaseModel):
    C_id: UUID
    C_name: str = Field(..., min_length=2)
    C_avail: bool

class CreateUpdateCategory(BaseModel):
    C_name: str = Field(..., min_length=2)
    C_avail: bool = True


class Item(BaseModel):
    I_id: UUID
    I_name: str = Field(..., min_length=2)
    I_price: int = Field(..., gt=0)
    I_avail: bool
    cat_id: UUID

class CreateItem(BaseModel):
    I_name: str = Field(..., min_length=2)
    I_price: int = Field(..., gt=0)
    I_avail: bool = True
    cat_id: UUID

class UpdateItem(BaseModel):
    I_name: str = Field(..., min_length=2)
    I_price: int = Field(..., gt=0)
    I_avail: bool = True
## Missing UUID because updating an item keeps it in the same category.
## If an item's category needs to be changed, then it has to be deleted and created in the corrected category.

