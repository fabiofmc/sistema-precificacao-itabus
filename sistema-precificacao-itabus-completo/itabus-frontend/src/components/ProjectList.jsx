import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, Trash2, Calendar, User } from 'lucide-react';

const ProjectList = () => {
  const { API_BASE_URL, user, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      setError('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchProjects();
        setSelectedProject(null);
      } else {
        setError('Erro ao excluir projeto');
      }
    } catch (error) {
      setError('Erro de conexão');
    }
  };

  const viewProject = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedProject(data);
      }
    } catch (error) {
      setError('Erro ao carregar detalhes do projeto');
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

  if (selectedProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Detalhes do Projeto</h3>
          <Button variant="outline" onClick={() => setSelectedProject(null)}>
            Voltar à Lista
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedProject.name}</span>
              <Badge variant="outline">
                ID: {selectedProject.id}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Criado em: {formatDate(selectedProject.created_at)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Usuário: {selectedProject.user_id}
                </span>
              </div>
            </div>

            {/* Itens do projeto */}
            <div>
              <h4 className="font-medium mb-3">Itens do Projeto:</h4>
              <div className="space-y-2">
                {selectedProject.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <div>
                      <span className="font-medium">{item.item_name}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({item.quantity}x por {item.duration} período(s))
                      </span>
                    </div>
                    <span className="font-medium">R$ {item.total_cost.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resultados financeiros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900">Custo Total</h4>
                <p className="text-2xl font-bold text-gray-800">
                  R$ {selectedProject.total_cost.toFixed(2)}
                </p>
              </Card>

              <Card className="p-4 bg-green-50">
                <h4 className="font-medium text-green-900">Preço Mínimo</h4>
                <p className="text-2xl font-bold text-green-800">
                  R$ {selectedProject.min_price.toFixed(2)}
                </p>
              </Card>

              <Card className="p-4 bg-blue-50">
                <h4 className="font-medium text-blue-900">Preço Alvo</h4>
                <p className="text-2xl font-bold text-blue-800">
                  R$ {selectedProject.target_price.toFixed(2)}
                </p>
              </Card>
            </div>

            {/* Ações */}
            <div className="pt-4 border-t">
              <Button 
                variant="destructive" 
                onClick={() => handleDelete(selectedProject.id)}
                disabled={!isAdmin && selectedProject.user_id !== user?.id}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Projeto
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Histórico de Projetos</h3>
        <p className="text-sm text-gray-600">
          {isAdmin ? 'Todos os projetos do sistema' : 'Seus projetos de precificação'}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-8">Carregando projetos...</div>
      ) : projects.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Nenhum projeto encontrado</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{project.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Custo Total:</span>
                    <span className="font-medium">R$ {project.total_cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Preço Alvo:</span>
                    <span className="font-medium text-blue-600">R$ {project.target_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Itens:</span>
                    <span className="font-medium">{project.items.length}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => viewProject(project.id)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDelete(project.id)}
                    disabled={!isAdmin && project.user_id !== user?.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;

