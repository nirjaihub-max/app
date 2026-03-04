from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient

# MongoDB client
client = MongoClient('mongodb://localhost:27017/')
db = client['user_db']  # change 'user_db' to your database name

# User model
class User:
    def __init__(self, email, password):
        self.email = email
        self.password = generate_password_hash(password)


# Initialize a blueprint
auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if db.users.find_one({'email': email}):
        return jsonify({'msg': 'User already exists'}), 409

    new_user = User(email, password)
    db.users.insert_one({'email': new_user.email, 'password': new_user.password})
    return jsonify({'msg': 'User created successfully'}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = db.users.find_one({'email': email})
    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=user['email'])
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({'msg': 'Invalid credentials'}), 401


@auth_bp.route('/token/refresh', methods=['POST'])
@jwt_required(refresh=True)
def token_refresh():
    current_user = get_jwt_identity()
    new_token = create_access_token(identity=current_user)
    return jsonify(access_token=new_token), 200


@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

