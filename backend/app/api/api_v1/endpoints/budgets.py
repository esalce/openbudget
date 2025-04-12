from typing import Any, List
import uuid
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.budget import Budget, CategoryGroup, Category
from app.schemas.budget import (
    BudgetCreate, 
    BudgetUpdate,
    Budget as BudgetSchema,
    CategoryGroupCreate,
    CategoryCreate
)
from app.services.budget_engine import BudgetEngine

router = APIRouter()


@router.get("/", response_model=List[BudgetSchema])
def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all budgets for the current user.
    """
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return budgets


@router.post("/", response_model=BudgetSchema, status_code=status.HTTP_201_CREATED)
def create_budget(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    budget_in: BudgetCreate
) -> Any:
    """
    Create a new budget.
    """
    # Create budget
    budget = Budget(
        name=budget_in.name,
        currency=budget_in.currency,
        start_date=budget_in.start_date,
        user_id=current_user.id
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    
    # Initialize with default categories and first month
    budget_engine = BudgetEngine(db)
    budget_engine.initialize_budget(budget.id)
    
    return budget


@router.get("/{budget_id}", response_model=BudgetSchema)
def get_budget(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    budget_id: uuid.UUID
) -> Any:
    """
    Get a single budget by ID.
    """
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    return budget


@router.put("/{budget_id}", response_model=BudgetSchema)
def update_budget(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    budget_id: uuid.UUID,
    budget_in: BudgetUpdate
) -> Any:
    """
    Update a budget.
    """
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Update attributes
    for field, value in budget_in.dict(exclude_unset=True).items():
        setattr(budget, field, value)
    
    db.add(budget)
    db.commit()
    db.refresh(budget)
    
    return budget


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    budget_id: uuid.UUID
) -> Any:
    """
    Delete a budget.
    """
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    db.delete(budget)
    db.commit()
    
    return None


# Category Group endpoints
@router.post("/{budget_id}/category-groups/", status_code=status.HTTP_201_CREATED)
def create_category_group(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    budget_id: uuid.UUID,
    category_group_in: CategoryGroupCreate
) -> Any:
    """
    Create a new category group.
    """
    # Verify budget ownership
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Create category group
    category_group = CategoryGroup(
        budget_id=budget_id,
        name=category_group_in.name,
        is_system=False,
        sort_order=999  # Place at end, can be reordered later
    )
    
    db.add(category_group)
    db.commit()
    db.refresh(category_group)
    
    return category_group


# Category endpoints
@router.post("/category-groups/{group_id}/categories/", status_code=status.HTTP_201_CREATED)
def create_category(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    group_id: uuid.UUID,
    category_in: CategoryCreate
) -> Any:
    """
    Create a new category.
    """
    # Verify category group existence and budget ownership
    category_group = db.query(CategoryGroup).join(Budget).filter(
        CategoryGroup.id == group_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not category_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category group not found"
        )
    
    # Create category
    category = Category(
        group_id=group_id,
        name=category_in.name,
        monthly_target_amount=category_in.monthly_target_amount,
        is_hidden=False,
        sort_order=999  # Place at end, can be reordered later
    )
    
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return category