import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { RepositoryList } from '@/components/code/RepositoryList';
import { RepositoryView } from '@/components/code/RepositoryView';
import { CodeEditor } from '@/components/code/CodeEditor';
import { User, Repository } from '@/types/user';

interface CodeViewProps {
  currentUser: User
}

type ViewMode = 'repositories' | 'repository' | 'editor'

export function CodeView({ currentUser }: CodeViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('repositories');
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  const handleRepositorySelect = (repository: Repository) => {
    setSelectedRepository(repository);
    setViewMode('repository');
  };

  const handleFileSelect = (filePath: string) => {
    setSelectedFilePath(filePath);
    setViewMode('editor');
  };

  const handleBackToRepositories = () => {
    setSelectedRepository(null);
    setSelectedFilePath(null);
    setViewMode('repositories');
  };

  const handleBackToRepository = () => {
    setSelectedFilePath(null);
    setViewMode('repository');
  };

  return (
    <div className="h-full flex flex-col">
      {viewMode === 'repositories' && (
        <RepositoryList
          currentUser={currentUser}
          onRepositorySelect={handleRepositorySelect}
        />
      )}
      
      {viewMode === 'repository' && selectedRepository && (
        <RepositoryView
          repository={selectedRepository}
          currentUser={currentUser}
          onFileSelect={handleFileSelect}
          onBack={handleBackToRepositories}
        />
      )}
      
      {viewMode === 'editor' && selectedRepository && selectedFilePath && (
        <CodeEditor
          repository={selectedRepository}
          filePath={selectedFilePath}
          currentUser={currentUser}
          onBack={handleBackToRepository}
        />
      )}
    </div>
  );
}