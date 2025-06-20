from flask import Blueprint, jsonify, request, session
from src.models.user import User, Item, GlobalRates, Project, ProjectItem, db
from functools import wraps

user_bp = Blueprint('user', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login required'}), 401
        user = User.query.get(session['user_id'])
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# ===== ROTAS DE AUTENTICAÇÃO =====

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    user = User(
        username=data['username'], 
        email=data['email'],
        role=data.get('role', 'comercial')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.to_dict()), 201

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        session['user_id'] = user.id
        return jsonify(user.to_dict()), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@user_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'}), 200

@user_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    user = User.query.get(session['user_id'])
    return jsonify(user.to_dict())

# ===== ROTAS DE USUÁRIOS =====

@user_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204

# ===== ROTAS DE ITENS =====

@user_bp.route('/items', methods=['GET'])
@login_required
def get_items():
    level = request.args.get('level', type=int)
    parent_id = request.args.get('parent_id', type=int)
    
    query = Item.query
    if level:
        query = query.filter_by(level=level)
    if parent_id:
        query = query.filter_by(parent_id=parent_id)
    elif parent_id is None and request.args.get('parent_id') == 'null':
        query = query.filter_by(parent_id=None)
    
    items = query.all()
    return jsonify([item.to_dict(include_children=True) for item in items])

@user_bp.route('/items', methods=['POST'])
@admin_required
def create_item():
    data = request.json
    
    item = Item(
        name=data['name'],
        level=data['level'],
        parent_id=data.get('parent_id'),
        cost=data.get('cost'),
        period=data.get('period')
    )
    
    db.session.add(item)
    db.session.commit()
    
    return jsonify(item.to_dict()), 201

@user_bp.route('/items/<int:item_id>', methods=['PUT'])
@admin_required
def update_item(item_id):
    item = Item.query.get_or_404(item_id)
    data = request.json
    
    item.name = data.get('name', item.name)
    item.cost = data.get('cost', item.cost)
    item.period = data.get('period', item.period)
    
    db.session.commit()
    
    return jsonify(item.to_dict())

@user_bp.route('/items/<int:item_id>', methods=['DELETE'])
@admin_required
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return '', 204

# ===== ROTAS DE TAXAS GLOBAIS =====

@user_bp.route('/global-rates', methods=['GET'])
@login_required
def get_global_rates():
    rates = GlobalRates.query.first()
    if not rates:
        rates = GlobalRates()
        db.session.add(rates)
        db.session.commit()
    return jsonify(rates.to_dict())

@user_bp.route('/global-rates', methods=['PUT'])
@admin_required
def update_global_rates():
    data = request.json
    rates = GlobalRates.query.first()
    
    if not rates:
        rates = GlobalRates()
        db.session.add(rates)
    
    rates.profit_min = data.get('profit_min', rates.profit_min)
    rates.profit_ideal = data.get('profit_ideal', rates.profit_ideal)
    rates.agency_commission = data.get('agency_commission', rates.agency_commission)
    rates.bv = data.get('bv', rates.bv)
    rates.taxes = data.get('taxes', rates.taxes)
    
    db.session.commit()
    
    return jsonify(rates.to_dict())

# ===== ROTAS DE PROJETOS =====

@user_bp.route('/projects', methods=['GET'])
@login_required
def get_projects():
    user = User.query.get(session['user_id'])
    if user.role == 'admin':
        projects = Project.query.all()
    else:
        projects = Project.query.filter_by(user_id=session['user_id']).all()
    
    return jsonify([project.to_dict() for project in projects])

@user_bp.route('/projects', methods=['POST'])
@login_required
def create_project():
    data = request.json
    
    project = Project(
        name=data['name'],
        user_id=session['user_id']
    )
    
    db.session.add(project)
    db.session.flush()  # Para obter o ID do projeto
    
    total_cost = 0
    
    # Adicionar itens ao projeto
    for item_data in data.get('items', []):
        item = Item.query.get(item_data['item_id'])
        if not item:
            continue
            
        unit_cost = item.cost or 0
        item_total_cost = unit_cost * item_data['quantity'] * item_data['duration']
        total_cost += item_total_cost
        
        project_item = ProjectItem(
            project_id=project.id,
            item_id=item_data['item_id'],
            quantity=item_data['quantity'],
            duration=item_data['duration'],
            unit_cost=unit_cost,
            total_cost=item_total_cost
        )
        
        db.session.add(project_item)
    
    # Calcular preços finais
    rates = GlobalRates.query.first()
    if rates:
        # Fórmula: Preço Final = Custo Total / (1 - (pLucro + pImposto + pComissão + pBV))
        denominator_ideal = 1 - ((rates.profit_ideal + rates.taxes + rates.agency_commission + rates.bv) / 100)
        denominator_min = 1 - ((rates.profit_min + rates.taxes + rates.agency_commission + rates.bv) / 100)
        
        if denominator_ideal > 0:
            project.target_price = total_cost / denominator_ideal
        if denominator_min > 0:
            project.min_price = total_cost / denominator_min
    
    project.total_cost = total_cost
    
    db.session.commit()
    
    return jsonify(project.to_dict()), 201

@user_bp.route('/projects/<int:project_id>', methods=['GET'])
@login_required
def get_project(project_id):
    project = Project.query.get_or_404(project_id)
    user = User.query.get(session['user_id'])
    
    if user.role != 'admin' and project.user_id != session['user_id']:
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(project.to_dict())

@user_bp.route('/projects/<int:project_id>', methods=['DELETE'])
@login_required
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)
    user = User.query.get(session['user_id'])
    
    if user.role != 'admin' and project.user_id != session['user_id']:
        return jsonify({'error': 'Access denied'}), 403
    
    db.session.delete(project)
    db.session.commit()
    return '', 204

# ===== ROTA PARA CÁLCULO DE PREÇOS =====

@user_bp.route('/calculate-price', methods=['POST'])
@login_required
def calculate_price():
    data = request.json
    items = data.get('items', [])
    
    total_cost = 0
    
    for item_data in items:
        item = Item.query.get(item_data['item_id'])
        if item and item.cost:
            item_cost = item.cost * item_data['quantity'] * item_data['duration']
            total_cost += item_cost
    
    rates = GlobalRates.query.first()
    if not rates:
        return jsonify({'error': 'Global rates not configured'}), 400
    
    # Calcular preços usando a fórmula
    denominator_ideal = 1 - ((rates.profit_ideal + rates.taxes + rates.agency_commission + rates.bv) / 100)
    denominator_min = 1 - ((rates.profit_min + rates.taxes + rates.agency_commission + rates.bv) / 100)
    
    if denominator_ideal <= 0 or denominator_min <= 0:
        return jsonify({'error': 'Invalid rates configuration'}), 400
    
    target_price = total_cost / denominator_ideal
    min_price = total_cost / denominator_min
    
    return jsonify({
        'total_cost': total_cost,
        'target_price': target_price,
        'min_price': min_price,
        'rates': rates.to_dict()
    })
