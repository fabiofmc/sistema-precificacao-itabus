import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, User, Mail, Calendar, Shield } from 'lucide-react';

const UserManager = () => {
  const { API_BASE_URL, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (userId === user?.id) {
      setError('Você não pode excluir sua própria conta');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        setError('Erro ao excluir usuário');
      }
    } catch (error) {
      setError('Erro de conexão');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <Badge variant="default">Administrador</Badge>;
    }
    return <Badge variant="secondary">Comercial</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Gerenciar Usuários</h3>
        <p className="text-sm text-gray-600">
          Visualize e gerencie todos os usuários do sistema
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-8">Carregando usuários...</div>
      ) : users.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Nenhum usuário encontrado</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(userItem => (
            <Card key={userItem.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="text-lg">{userItem.username}</span>
                  </div>
                  {getRoleBadge(userItem.role)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{userItem.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      Criado em: {formatDate(userItem.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      Perfil: {userItem.role === 'admin' ? 'Administrador' : 'Comercial'}
                    </span>
                  </div>
                </div>

                {userItem.id === user?.id && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      Este é você!
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDelete(userItem.id)}
                    disabled={userItem.id === user?.id}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {userItem.id === user?.id ? 'Não é possível excluir' : 'Excluir Usuário'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Informações Importantes</h4>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Apenas administradores podem gerenciar usuários</li>
                <li>• Você não pode excluir sua própria conta</li>
                <li>• Novos usuários podem se cadastrar na tela de login</li>
                <li>• Por padrão, novos usuários têm perfil "Comercial"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManager;

