from datetime import date, datetime
import uuid
from enum import Enum
from typing import List, Optional

from sqlalchemy import String, Integer, Date, DateTime, ForeignKey, Text, Boolean, UUID, Enum as SQLAlchemyEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.mixins import TimestampMixin


class TransactionType(str, Enum):
    EXPENSE = "expense"
    INCOME = "income"
    TRANSFER = "transfer"


class Transaction(Base, TimestampMixin):
    """Transaction model representing a financial transaction."""
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID, primary_key=True, default=uuid.uuid4
    )
    budget_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("budget.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    payee: Mapped[str] = mapped_column(String(200), nullable=True)
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID, ForeignKey("category.id", ondelete="SET NULL"), nullable=True
    )
    memo: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cleared: Mapped[bool] = mapped_column(Boolean, default=False)
    transaction_type: Mapped[TransactionType] = mapped_column(
        SQLAlchemyEnum(TransactionType), nullable=False
    )
    
    # For transfers
    transfer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID, ForeignKey("transaction.id"), nullable=True
    )
    
    # If this is a split transaction
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID, ForeignKey("transaction.id", ondelete="CASCADE"), nullable=True
    )
    
    # Relationships
    budget: Mapped["Budget"] = relationship("Budget", back_populates="transactions")
    category: Mapped[Optional["Category"]] = relationship("Category", back_populates="transactions")
    transfer_transaction: Mapped[Optional["Transaction"]] = relationship(
        "Transaction", 
        remote_side=[id], 
        foreign_keys=[transfer_id],
        uselist=False,
        back_populates="transfer_transaction",
    )
    parent_transaction: Mapped[Optional["Transaction"]] = relationship(
        "Transaction", 
        remote_side=[id], 
        foreign_keys=[parent_id],
        back_populates="split_transactions"
    )
    split_transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction", 
        foreign_keys=[parent_id],
        back_populates="parent_transaction", 
        cascade="all, delete-orphan"
    )