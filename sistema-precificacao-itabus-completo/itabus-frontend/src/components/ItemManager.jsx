import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react';

const ItemManager = () => {
  const { API_BASE_URL } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    level: 1,
    parent_id: null,
    cost: '',
    period: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      setError('Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      parent_id: formData.parent_id || null
    };

    try {
      const url = editingItem 
        ? `${API_BASE_URL}/items/${editingItem.id}`
        : `${API_BASE_URL}/items`;
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchItems();
        resetForm();
      } else {
        const error = await response.json();
        setError(error.error || 'Erro ao salvar item');
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchItems();
      } else {
        setError('Erro ao excluir item');
      }
    } catch (error) {
      setError('Erro de conexão');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      level: 1,
      parent_id: null,
      cost: '',
      period: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const startEdit = (item) => {
    setFormData({
      name: item.name,
      level: item.level,
      parent_id: item.parent_id,
      cost: item.cost || '',
      period: item.period || ''
    });
    setEditingItem(item);
    setShowForm(true);
  };

  const getParentOptions = () => {
    if (formData.level === 1) return [];
    if (formData.level === 2) return items.filter(item => item.level === 1);
    if (formData.level === 3) return items.filter(item => item.level === 2);
    return [];
  };

  const renderItemTree = (items, level = 1, parentId = null) => {
    const filteredItems = items.filter(item => 
      item.level === level && item.parent_id === parentId
    );

    return filteredItems.map(item => (
      <div key={item.id} className="mb-2">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {level > 1 && <ChevronRight className="h-4 w-4 text-gray-400" />}
              <Badge variant={level === 1 ? 'default' : level === 2 ? 'secondary' : 'outline'}>
                Nível {level}
              </Badge>
              <span className="font-medium">{item.name}</span>
              {item.cost && (
                <span className="text-sm text-gray-600">
                  R$ {item.cost.toFixed(2)} / {item.period}
                </span>
              )}
              <span className="text-sm text-gray-500">
                (Total: R$ {item.total_cost.toFixed(2)})
              </span>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
        
        {level < 3 && (
          <div className="ml-6 mt-2">
            {renderItemTree(items, level + 1, item.id)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Itens de Precificação</h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Editar Item' : 'Novo Item'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Item</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Nível</Label>
                  <Select 
                    value={formData.level.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, level: parseInt(value), parent_id: null })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Nível 1 (Categoria)</SelectItem>
                      <SelectItem value="2">Nível 2 (Subcategoria)</SelectItem>
                      <SelectItem value="3">Nível 3 (Especificação)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.level > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="parent">Item Pai</Label>
                  <Select 
                    value={formData.parent_id?.toString() || ''} 
                    onValueChange={(value) => setFormData({ ...formData, parent_id: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o item pai" />
                    </SelectTrigger>
                    <SelectContent>
                      {getParentOptions().map(item => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Custo (R$)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="Deixe vazio se não for item final"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Período</Label>
                  <Select 
                    value={formData.period} 
                    onValueChange={(value) => setFormData({ ...formData, period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semana">Por Semana</SelectItem>
                      <SelectItem value="mes">Por Mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Carregando itens...</div>
        ) : (
          renderItemTree(items)
        )}
      </div>
    </div>
  );
};

export default ItemManager;

