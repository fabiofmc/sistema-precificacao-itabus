import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calculator, ChevronRight } from 'lucide-react';

const ProjectCreator = () => {
  const { API_BASE_URL } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculation, setCalculation] = useState(null);
  const [step, setStep] = useState(1); // 1: Seleção, 2: Configuração, 3: Resultado

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
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
    }
  };

  const getItemsByLevel = (level, parentId = null) => {
    return items.filter(item => 
      item.level === level && item.parent_id === parentId
    );
  };

  const getItemsWithCost = () => {
    return items.filter(item => item.cost && item.cost > 0);
  };

  const addItemToProject = (item) => {
    if (selectedItems.find(selected => selected.item.id === item.id)) {
      return; // Item já selecionado
    }

    setSelectedItems([...selectedItems, {
      item,
      quantity: 1,
      duration: 1
    }]);
  };

  const removeItemFromProject = (itemId) => {
    setSelectedItems(selectedItems.filter(selected => selected.item.id !== itemId));
  };

  const updateItemConfig = (itemId, field, value) => {
    setSelectedItems(selectedItems.map(selected => 
      selected.item.id === itemId 
        ? { ...selected, [field]: parseInt(value) || 1 }
        : selected
    ));
  };

  const calculateProject = async () => {
    if (!projectName.trim()) {
      setError('Digite um nome para o projeto');
      return;
    }

    if (selectedItems.length === 0) {
      setError('Selecione pelo menos um item');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const projectData = {
        name: projectName,
        items: selectedItems.map(selected => ({
          item_id: selected.item.id,
          quantity: selected.quantity,
          duration: selected.duration
        }))
      };

      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const result = await response.json();
        setCalculation(result);
        setStep(3);
      } else {
        const error = await response.json();
        setError(error.error || 'Erro ao calcular projeto');
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const resetProject = () => {
    setSelectedItems([]);
    setProjectName('');
    setCalculation(null);
    setStep(1);
    setError('');
  };

  const renderItemSelection = () => {
    const level1Items = getItemsByLevel(1);
    const itemsWithCost = getItemsWithCost();

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Selecionar Itens para o Projeto</h3>
          
          {/* Navegação por hierarquia */}
          <div className="space-y-4">
            <h4 className="font-medium">Navegar por Categoria:</h4>
            {level1Items.map(level1 => (
              <Card key={level1.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge>Nível 1</Badge>
                      <span className="font-medium">{level1.name}</span>
                      {level1.cost && (
                        <Button 
                          size="sm" 
                          onClick={() => addItemToProject(level1)}
                          disabled={selectedItems.find(s => s.item.id === level1.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Nível 2 */}
                  {getItemsByLevel(2, level1.id).map(level2 => (
                    <div key={level2.id} className="ml-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                          <Badge variant="secondary">Nível 2</Badge>
                          <span>{level2.name}</span>
                          {level2.cost && (
                            <Button 
                              size="sm" 
                              onClick={() => addItemToProject(level2)}
                              disabled={selectedItems.find(s => s.item.id === level2.id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Adicionar
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Nível 3 */}
                      {getItemsByLevel(3, level2.id).map(level3 => (
                        <div key={level3.id} className="ml-12">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                              <Badge variant="outline">Nível 3</Badge>
                              <span>{level3.name}</span>
                              {level3.cost && (
                                <span className="text-sm text-gray-600">
                                  R$ {level3.cost.toFixed(2)} / {level3.period}
                                </span>
                              )}
                            </div>
                            {level3.cost && (
                              <Button 
                                size="sm" 
                                onClick={() => addItemToProject(level3)}
                                disabled={selectedItems.find(s => s.item.id === level3.id)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Adicionar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Lista rápida de itens com custo */}
          <div className="mt-8">
            <h4 className="font-medium mb-4">Ou selecione diretamente dos itens disponíveis:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {itemsWithCost.map(item => (
                <Card key={item.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={item.level === 1 ? 'default' : item.level === 2 ? 'secondary' : 'outline'}>
                        Nível {item.level}
                      </Badge>
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      R$ {item.cost.toFixed(2)} / {item.period}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => addItemToProject(item)}
                      disabled={selectedItems.find(s => s.item.id === item.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {selectedItems.find(s => s.item.id === item.id) ? 'Adicionado' : 'Adicionar'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="pt-6 border-t">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Itens Selecionados ({selectedItems.length})</h4>
              <Button onClick={() => setStep(2)}>
                Configurar Quantidades
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-2">
              {selectedItems.map(selected => (
                <div key={selected.item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <span>{selected.item.name}</span>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => removeItemFromProject(selected.item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderItemConfiguration = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Configurar Projeto</h3>
          <Button variant="outline" onClick={() => setStep(1)}>
            Voltar à Seleção
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="projectName">Nome do Projeto</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Digite o nome do projeto"
              required
            />
          </div>

          <div>
            <h4 className="font-medium mb-4">Configurar Quantidades e Duração</h4>
            <div className="space-y-4">
              {selectedItems.map(selected => (
                <Card key={selected.item.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <div className="font-medium">{selected.item.name}</div>
                      <div className="text-sm text-gray-600">
                        R$ {selected.item.cost.toFixed(2)} / {selected.item.period}
                      </div>
                    </div>
                    <div>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={selected.quantity}
                        onChange={(e) => updateItemConfig(selected.item.id, 'quantity', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Duração ({selected.item.period}s)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={selected.duration}
                        onChange={(e) => updateItemConfig(selected.item.id, 'duration', e.target.value)}
                      />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Subtotal:</div>
                      <div className="font-bold">
                        R$ {(selected.item.cost * selected.quantity * selected.duration).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-semibold">
                  Custo Total: R$ {selectedItems.reduce((total, selected) => 
                    total + (selected.item.cost * selected.quantity * selected.duration), 0
                  ).toFixed(2)}
                </div>
              </div>
              <Button onClick={calculateProject} disabled={loading}>
                <Calculator className="h-4 w-4 mr-2" />
                {loading ? 'Calculando...' : 'Calcular Preços'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!calculation) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Resultado da Precificação</h3>
          <Button variant="outline" onClick={resetProject}>
            Novo Projeto
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{calculation.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resumo dos itens */}
            <div>
              <h4 className="font-medium mb-3">Itens do Projeto:</h4>
              <div className="space-y-2">
                {calculation.items.map(item => (
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
                  R$ {calculation.total_cost.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Soma de todos os custos
                </p>
              </Card>

              <Card className="p-4 bg-green-50">
                <h4 className="font-medium text-green-900">Preço Mínimo</h4>
                <p className="text-2xl font-bold text-green-800">
                  R$ {calculation.min_price.toFixed(2)}
                </p>
                <p className="text-sm text-green-600">
                  Com margem mínima de lucro
                </p>
              </Card>

              <Card className="p-4 bg-blue-50">
                <h4 className="font-medium text-blue-900">Preço Alvo</h4>
                <p className="text-2xl font-bold text-blue-800">
                  R$ {calculation.target_price.toFixed(2)}
                </p>
                <p className="text-sm text-blue-600">
                  Com margem ideal de lucro
                </p>
              </Card>
            </div>

            {/* Detalhamento do preço alvo */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Detalhamento do Preço Alvo:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Custo:</span>
                  <div className="font-medium">R$ {calculation.total_cost.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-blue-700">Lucro:</span>
                  <div className="font-medium">R$ {(calculation.target_price - calculation.total_cost).toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-blue-700">Margem:</span>
                  <div className="font-medium">
                    {(((calculation.target_price - calculation.total_cost) / calculation.target_price) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">Total:</span>
                  <div className="font-medium">R$ {calculation.target_price.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 1 && renderItemSelection()}
      {step === 2 && renderItemConfiguration()}
      {step === 3 && renderResults()}
    </div>
  );
};

export default ProjectCreator;

