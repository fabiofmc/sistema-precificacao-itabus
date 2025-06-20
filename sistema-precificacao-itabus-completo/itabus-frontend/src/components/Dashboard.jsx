import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Settings, Calculator, FolderOpen, Users } from 'lucide-react';
import ItemManager from './ItemManager';
import GlobalRatesManager from './GlobalRatesManager';
import ProjectCreator from './ProjectCreator';
import ProjectList from './ProjectList';
import UserManager from './UserManager';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Sistema de Precificação Itabus
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {user?.username} ({user?.role === 'admin' ? 'Administrador' : 'Comercial'})
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Projetos
            </TabsTrigger>
            <TabsTrigger value="project-list" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="items" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Itens
                </TabsTrigger>
                <TabsTrigger value="rates" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Taxas
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Usuários
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="projects">
              <Card>
                <CardHeader>
                  <CardTitle>Criar Novo Projeto de Precificação</CardTitle>
                  <CardDescription>
                    Selecione os itens e configure as quantidades para gerar um orçamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProjectCreator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="project-list">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Projetos</CardTitle>
                  <CardDescription>
                    Visualize e gerencie seus projetos de precificação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProjectList />
                </CardContent>
              </Card>
            </TabsContent>

            {isAdmin && (
              <>
                <TabsContent value="items">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gerenciar Itens de Precificação</CardTitle>
                      <CardDescription>
                        Configure a hierarquia de itens e seus custos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ItemManager />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="rates">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurar Taxas Globais</CardTitle>
                      <CardDescription>
                        Defina as taxas percentuais utilizadas nos cálculos de precificação
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <GlobalRatesManager />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="users">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gerenciar Usuários</CardTitle>
                      <CardDescription>
                        Visualize e gerencie os usuários do sistema
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <UserManager />
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;

