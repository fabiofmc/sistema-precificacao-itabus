import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save } from 'lucide-react';

const GlobalRatesManager = () => {
  const { API_BASE_URL } = useAuth();
  const [rates, setRates] = useState({
    profit_min: 0,
    profit_ideal: 0,
    agency_commission: 0,
    bv: 0,
    taxes: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/global-rates`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRates(data);
      }
    } catch (error) {
      setError('Erro ao carregar taxas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/global-rates`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(rates),
      });

      if (response.ok) {
        setSuccess('Taxas atualizadas com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const error = await response.json();
        setError(error.error || 'Erro ao salvar taxas');
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setRates({
      ...rates,
      [field]: parseFloat(value) || 0
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Configuração de Taxas Globais</h3>
        <p className="text-sm text-gray-600">
          Estas taxas serão aplicadas em todos os cálculos de precificação do sistema.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Taxas Percentuais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="profit_min">% Lucro Mínimo</Label>
                <Input
                  id="profit_min"
                  type="number"
                  step="0.01"
                  value={rates.profit_min}
                  onChange={(e) => handleInputChange('profit_min', e.target.value)}
                  placeholder="Ex: 10.00"
                />
                <p className="text-xs text-gray-500">
                  Margem mínima de lucro para cálculo do preço mínimo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profit_ideal">% Lucro Ideal</Label>
                <Input
                  id="profit_ideal"
                  type="number"
                  step="0.01"
                  value={rates.profit_ideal}
                  onChange={(e) => handleInputChange('profit_ideal', e.target.value)}
                  placeholder="Ex: 20.00"
                />
                <p className="text-xs text-gray-500">
                  Margem ideal de lucro para cálculo do preço alvo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agency_commission">% Comissão de Agência</Label>
                <Input
                  id="agency_commission"
                  type="number"
                  step="0.01"
                  value={rates.agency_commission}
                  onChange={(e) => handleInputChange('agency_commission', e.target.value)}
                  placeholder="Ex: 5.00"
                />
                <p className="text-xs text-gray-500">
                  Comissão paga para agências parceiras
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bv">% BV (Bonificação por Volume)</Label>
                <Input
                  id="bv"
                  type="number"
                  step="0.01"
                  value={rates.bv}
                  onChange={(e) => handleInputChange('bv', e.target.value)}
                  placeholder="Ex: 3.00"
                />
                <p className="text-xs text-gray-500">
                  Bonificação por volume de vendas
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="taxes">% Impostos sobre Venda</Label>
                <Input
                  id="taxes"
                  type="number"
                  step="0.01"
                  value={rates.taxes}
                  onChange={(e) => handleInputChange('taxes', e.target.value)}
                  placeholder="Ex: 15.00"
                />
                <p className="text-xs text-gray-500">
                  Impostos incidentes sobre as vendas
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Fórmula de Cálculo:</h4>
                <p className="text-sm text-blue-800">
                  <strong>Preço Final = Custo Total ÷ (1 - (% Lucro + % Impostos + % Comissão + % BV) ÷ 100)</strong>
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Esta fórmula garante que após deduzir todas as taxas, o valor restante seja exatamente o custo total do projeto.
                </p>
              </div>

              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Taxas'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview dos cálculos */}
      <Card>
        <CardHeader>
          <CardTitle>Simulação de Cálculo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Para um projeto com custo total de R$ 1.000,00:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Preço Mínimo</h4>
                <p className="text-2xl font-bold text-green-800">
                  R$ {(1000 / (1 - (rates.profit_min + rates.taxes + rates.agency_commission + rates.bv) / 100)).toFixed(2)}
                </p>
                <p className="text-xs text-green-700">
                  Com {rates.profit_min}% de lucro mínimo
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Preço Alvo</h4>
                <p className="text-2xl font-bold text-blue-800">
                  R$ {(1000 / (1 - (rates.profit_ideal + rates.taxes + rates.agency_commission + rates.bv) / 100)).toFixed(2)}
                </p>
                <p className="text-xs text-blue-700">
                  Com {rates.profit_ideal}% de lucro ideal
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalRatesManager;

