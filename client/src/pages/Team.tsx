import TopBar from "@/components/TopBar";

export default function Team() {
  return (
    <>
      <TopBar 
        title="Equipe" 
        description="Gerenciar membros da equipe e suas funções"
      />
      
      <div className="flex-1 overflow-auto p-6 bg-gray-10">
        <div className="bg-white rounded-lg border border-gray-20 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Gerenciamento de Equipe</h3>
          <p className="text-gray-50">Esta página conterá recursos de gerenciamento de membros da equipe e atribuição de funções.</p>
        </div>
      </div>
    </>
  );
}
