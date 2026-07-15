import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {

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
            Política de Privacidade
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              1. Introdução
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              O Recta ("nós", "nosso" ou "aplicativo") está comprometido em proteger sua privacidade. Esta Política de Privacidade 
              explica como coletamos, usamos, divulgamos e protegemos suas informações quando você usa nosso serviço de gerenciamento financeiro.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              2. Informações que Coletamos
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-4">
              2.1. Informações de Conta
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Quando você cria uma conta, coletamos:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Nome e endereço de e-mail</li>
              <li>Informações de autenticação (através do Firebase)</li>
              <li>Preferências de idioma e moeda</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
              2.2. Dados Financeiros
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Para fornecer nossos serviços, coletamos e armazenamos:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Transações financeiras (receitas, despesas, transferências)</li>
              <li>Informações de contas bancárias e cartões de crédito</li>
              <li>Orçamentos e categorias de gastos</li>
              <li>Metas de economia</li>
              <li>Relatórios e análises financeiras</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
              2.3. Dados de Uso
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Coletamos automaticamente informações sobre como você usa o serviço:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Logs de acesso e atividade</li>
              <li>Preferências de interface e configurações</li>
              <li>Informações de dispositivo e navegador</li>
              <li>Endereço IP e localização aproximada</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              3. Como Usamos suas Informações
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Usamos as informações coletadas para:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Fornecer, manter e melhorar nossos serviços</li>
              <li>Processar transações e gerenciar sua conta</li>
              <li>Enviar notificações importantes sobre o serviço</li>
              <li>Personalizar sua experiência no aplicativo</li>
              <li>Detectar e prevenir fraudes ou atividades suspeitas</li>
              <li>Cumprir obrigações legais e regulatórias</li>
              <li>Analisar o uso do serviço para melhorias</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              4. Compartilhamento de Informações
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas nas seguintes circunstâncias:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>
                <strong>Com outros membros do household:</strong> Se você participa de um household compartilhado, 
                suas transações e dados financeiros podem ser visíveis para outros membros autorizados
              </li>
              <li>
                <strong>Prestadores de serviços:</strong> Com empresas que nos ajudam a operar o serviço 
                (hospedagem, análise, suporte), sujeitos a acordos de confidencialidade
              </li>
              <li>
                <strong>Requisitos legais:</strong> Quando necessário para cumprir leis, regulamentos ou processos legais
              </li>
              <li>
                <strong>Proteção de direitos:</strong> Para proteger nossos direitos, propriedade ou segurança, 
                ou de nossos usuários
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              5. Segurança dos Dados
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Autenticação segura através do Firebase</li>
              <li>Acesso restrito a dados pessoais apenas para funcionários autorizados</li>
              <li>Monitoramento regular de segurança e auditorias</li>
              <li>Backups regulares dos dados</li>
              <li>Conformidade com padrões de segurança da indústria e LGPD</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Estamos comprometidos em manter os mais altos padrões de segurança e continuamente aprimoramos nossas 
              medidas de proteção para garantir a segurança de suas informações financeiras.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              6. Seus Direitos
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem os seguintes direitos:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>Acesso:</strong> Solicitar acesso às suas informações pessoais</li>
              <li><strong>Correção:</strong> Solicitar correção de dados incompletos ou inexatos</li>
              <li><strong>Exclusão:</strong> Solicitar exclusão de dados quando não mais necessários</li>
              <li><strong>Portabilidade:</strong> Solicitar a portabilidade de seus dados</li>
              <li><strong>Revogação:</strong> Revogar consentimento a qualquer momento</li>
              <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados em certas circunstâncias</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Para exercer esses direitos, entre em contato conosco através dos canais de suporte disponíveis na plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              7. Retenção de Dados
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Mantemos suas informações pessoais apenas pelo tempo necessário para fornecer nossos serviços e cumprir 
              nossas obrigações legais. Quando você exclui sua conta, excluímos ou anonimizamos suas informações pessoais, 
              exceto quando a retenção é necessária para fins legais ou de segurança.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              8. Cookies e Tecnologias Similares
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Usamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do serviço e personalizar conteúdo. 
              Você pode controlar o uso de cookies através das configurações do seu navegador.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              9. Privacidade de Menores
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              O Recta não é destinado a menores de 18 anos. Não coletamos intencionalmente informações pessoais de menores. 
              Se descobrirmos que coletamos informações de um menor, tomaremos medidas para excluir essas informações imediatamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              10. Alterações nesta Política
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas 
              publicando a nova política nesta página e atualizando a data de "Última atualização". Recomendamos que você revise 
              esta política periodicamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              11. Transferência Internacional de Dados
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Seus dados podem ser processados e armazenados em servidores localizados fora do Brasil. Ao usar nosso serviço, 
              você consente com a transferência de suas informações para esses servidores, que são protegidos por medidas de 
              segurança adequadas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              12. Contato
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Se você tiver dúvidas, preocupações ou solicitações relacionadas a esta Política de Privacidade ou ao tratamento 
              de seus dados pessoais, entre em contato conosco através dos canais de suporte disponíveis na plataforma.
            </p>
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

export default PrivacyPolicy;
