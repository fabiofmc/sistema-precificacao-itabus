from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='comercial')  # 'admin' ou 'comercial'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    level = db.Column(db.Integer, nullable=False)  # 1, 2 ou 3
    parent_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=True)
    cost = db.Column(db.Float, nullable=True)  # Custo em reais
    period = db.Column(db.String(10), nullable=True)  # 'semana' ou 'mes'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    parent = db.relationship('Item', remote_side=[id], backref='children')

    def __repr__(self):
        return f'<Item {self.name} (Level {self.level})>'

    def get_total_cost(self):
        """Calcula o custo total incluindo filhos"""
        if self.cost is not None:
            return self.cost
        
        total = 0
        for child in self.children:
            total += child.get_total_cost()
        return total

    def to_dict(self, include_children=False):
        result = {
            'id': self.id,
            'name': self.name,
            'level': self.level,
            'parent_id': self.parent_id,
            'cost': self.cost,
            'period': self.period,
            'total_cost': self.get_total_cost(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_children:
            result['children'] = [child.to_dict(include_children=True) for child in self.children]
        
        return result

class GlobalRates(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    profit_min = db.Column(db.Float, nullable=False, default=0.0)  # % Lucro Mínimo
    profit_ideal = db.Column(db.Float, nullable=False, default=0.0)  # % Lucro Ideal
    agency_commission = db.Column(db.Float, nullable=False, default=0.0)  # % Comissão de Agência
    bv = db.Column(db.Float, nullable=False, default=0.0)  # % BV
    taxes = db.Column(db.Float, nullable=False, default=0.0)  # % Impostos sobre Venda
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'profit_min': self.profit_min,
            'profit_ideal': self.profit_ideal,
            'agency_commission': self.agency_commission,
            'bv': self.bv,
            'taxes': self.taxes,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_cost = db.Column(db.Float, nullable=False, default=0.0)
    target_price = db.Column(db.Float, nullable=False, default=0.0)
    min_price = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    user = db.relationship('User', backref='projects')
    items = db.relationship('ProjectItem', backref='project', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id,
            'total_cost': self.total_cost,
            'target_price': self.target_price,
            'min_price': self.min_price,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'items': [item.to_dict() for item in self.items]
        }

class ProjectItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    duration = db.Column(db.Integer, nullable=False, default=1)  # em semanas ou meses
    unit_cost = db.Column(db.Float, nullable=False)
    total_cost = db.Column(db.Float, nullable=False)
    
    # Relacionamentos
    item = db.relationship('Item', backref='project_items')

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'item_id': self.item_id,
            'item_name': self.item.name if self.item else None,
            'quantity': self.quantity,
            'duration': self.duration,
            'unit_cost': self.unit_cost,
            'total_cost': self.total_cost
        }
