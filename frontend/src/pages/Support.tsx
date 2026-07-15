import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, HelpCircle, FileText, Shield } from 'lucide-react';

const Support = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Central de Suporte
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Estamos aqui para ajudar! Encontre respostas para suas dúvidas ou entre em contato conosco.
          </p>

          {/* Quick Links */}
          <section className="mb-12">
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                to="/terms"
                className="flex items-start p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors group"
              >
                <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    Termos de Uso
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Leia nossos termos e condições de uso do serviço
                  </p>
                </div>
              </Link>

              <Link
                to="/privacy"
                className="flex items-start p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors group"
              >
                <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    Política de Privacidade
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Entenda como protegemos e tratamos seus dados pessoais
                  </p>
                </div>
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <HelpCircle className="h-8 w-8 mr-3 text-primary-600 dark:text-primary-400" />
              Perguntas Frequentes
            </h2>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Como criar uma conta no Recta?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Para criar uma conta, clique em "Começar" na página inicial e siga as instruções. 
                  Você precisará fornecer um endereço de e-mail válido e criar uma senha segura. 
                  Após a criação, você receberá um e-mail de confirmação.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Como adicionar uma transação?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Vá até a página de Transações e clique no botão "Nova Transação". Preencha os campos 
                  necessários (tipo, valor, data, categoria, conta) e salve. Você também pode usar o atalho 
                  de teclado ou o menu de comandos (Cmd+K ou Ctrl+K) para criar transações rapidamente.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Como criar um orçamento?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Acesse a página de Orçamentos e clique em "Novo Orçamento". Defina uma categoria, 
                  o valor limite e o período (mensal, semanal, etc.). O Recta acompanhará seus gastos 
                  e alertará quando você estiver próximo ou ultrapassar o limite.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Como funciona o compartilhamento de household?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Um household permite que você compartilhe suas finanças com familiares ou parceiros. 
                  Você pode criar um household nas configurações e convidar outros usuários por e-mail. 
                  Todos os membros podem visualizar e gerenciar as transações e contas compartilhadas.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Meus dados estão seguros?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Sim! Utilizamos criptografia de ponta a ponta, autenticação segura através do Firebase, 
                  e seguimos todas as normas da LGPD. Seus dados financeiros são protegidos com os mais altos 
                  padrões de segurança da indústria. Para mais detalhes, consulte nossa Política de Privacidade.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Como exportar meus dados?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Você pode exportar seus dados a qualquer momento através das Configurações. 
                  Selecione o formato desejado (CSV, JSON) e o período que deseja exportar. 
                  Os dados serão preparados e disponibilizados para download.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  O Recta é gratuito?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Sim! Atualmente o Recta está em versão beta e é totalmente gratuito. 
                  No futuro, planejamos oferecer planos premium com recursos adicionais, 
                  mas a versão básica continuará disponível gratuitamente.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Como alterar minha senha?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Acesse as Configurações e vá até a seção "Segurança". Lá você pode alterar sua senha. 
                  Se você esqueceu sua senha, use a opção "Esqueci minha senha" na página de login.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <MessageCircle className="h-8 w-8 mr-3 text-primary-600 dark:text-primary-400" />
              Entre em Contato
            </h2>

            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-8 border border-primary-200 dark:border-primary-800">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Não encontrou a resposta que procurava? Nossa equipe está pronta para ajudar! 
                Entre em contato conosco através dos canais abaixo:
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      E-mail de Suporte
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Envie um e-mail para nossa equipe de suporte. Responderemos o mais rápido possível, 
                      geralmente em até 24 horas úteis.
                    </p>
                    <p className="text-primary-600 dark:text-primary-400 font-medium mt-2">
                      apps@oprimo.dev
                    </p>
                  </div>
                </div>

                <div className="flex items-start pt-4 border-t border-primary-200 dark:border-primary-800">
                  <MessageCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Feedback e Sugestões
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Tem uma ideia para melhorar o Recta? Adoraríamos ouvir! Use o modal de feedback 
                      dentro do aplicativo (disponível no menu de comandos) ou envie um e-mail.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tips Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Dicas para Usar o Recta
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  💡 Use Categorias
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Organize suas transações com categorias personalizadas para ter melhor controle 
                  sobre seus gastos e gerar relatórios mais precisos.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  🎯 Defina Metas
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Crie metas de economia para objetivos específicos. O Recta acompanhará seu progresso 
                  e te ajudará a alcançar seus objetivos financeiros.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  📊 Acompanhe Relatórios
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use a página de Relatórios para visualizar gráficos e análises detalhadas dos seus 
                  gastos e receitas ao longo do tempo.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  ⌨️ Atalhos de Teclado
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use Cmd+K (Mac) ou Ctrl+K (Windows/Linux) para abrir o menu de comandos e navegar 
                  rapidamente pelo aplicativo.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Recta. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Support;
