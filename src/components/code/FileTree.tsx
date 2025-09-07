import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { File, Folder, FolderOpen, GitBranch, Calendar, User as UserIcon } from '@phosphor-icons/react';
import { Repository, User, RepositoryFile } from '@/types/user';

interface FileTreeProps {
  repository: Repository
  currentUser: User
  onFileSelect: (filePath: string) => void
  selectedBranch: string
  onBranchChange: (branch: string) => void
}

export function FileTree({ repository, currentUser, onFileSelect, selectedBranch, onBranchChange }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const getFileIcon = (file: RepositoryFile) => {
    if (file.isDirectory) {
      return expandedFolders.has(file.path) ? FolderOpen : Folder;
    }
    return File;
  };

  const getLanguageFromFileName = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const langMap: { [key: string]: string } = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'py': 'Python',
      'go': 'Go',
      'rs': 'Rust',
      'c': 'C',
      'cpp': 'C++',
      'sh': 'Shell',
      'ps1': 'PowerShell',
      'md': 'Markdown',
      'json': 'JSON',
      'yaml': 'YAML',
      'yml': 'YAML'
    };
    return langMap[ext || ''] || 'Text';
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) {return '0 B';}
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {return 'yesterday';}
    if (diffDays < 7) {return `${diffDays} days ago`;}
    if (diffDays < 30) {return `${Math.floor(diffDays / 7)} weeks ago`;}
    if (diffDays < 365) {return `${Math.floor(diffDays / 30)} months ago`;}
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const renderFileTreeItem = (file: RepositoryFile, depth: number = 0) => {
    const Icon = getFileIcon(file);
    const isExpanded = expandedFolders.has(file.path);

    return (
      <div key={file.id}>
        <div
          className={`flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer ${
            file.isDirectory ? '' : 'hover:bg-accent/10'
          }`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => {
            if (file.isDirectory) {
              toggleFolder(file.path);
            } else {
              onFileSelect(file.path);
            }
          }}
        >
          <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">
            {file.name}
          </span>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">
            {formatDate(file.lastModified)}
          </span>
          {!file.isDirectory && (
            <span className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
          )}
        </div>
        
        {file.isDirectory && isExpanded && file.children && (
          <div>
            {file.children.map(child => renderFileTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Build file tree structure for display
  const buildFileTree = (): RepositoryFile[] => {
    const tree: RepositoryFile[] = [];
    const folders: { [key: string]: RepositoryFile } = {};

    // First, create all directory entries
    repository.files.forEach(file => {
      const pathParts = file.path.split('/').filter(Boolean);
      let currentPath = '';
      
      pathParts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : `/${part}`;
        
        if (index === pathParts.length - 1 && !file.isDirectory) {
          // This is a file
          const parentFolder = parentPath ? folders[parentPath] : null;
          if (parentFolder) {
            if (!parentFolder.children) {parentFolder.children = [];}
            parentFolder.children.push(file);
          } else {
            tree.push(file);
          }
        } else if (!folders[currentPath]) {
          // This is a directory
          const dirFile: RepositoryFile = {
            id: `dir-${currentPath}`,
            name: part,
            path: currentPath,
            content: '',
            language: 'directory',
            size: 0,
            lastModified: new Date().toISOString(),
            lastCommit: '',
            isDirectory: true,
            children: []
          };
          
          folders[currentPath] = dirFile;
          
          const parentFolder = parentPath ? folders[parentPath] : null;
          if (parentFolder) {
            if (!parentFolder.children) {parentFolder.children = [];}
            parentFolder.children.push(dirFile);
          } else {
            tree.push(dirFile);
          }
        }
      });
    });

    // Sort directories first, then files
    const sortItems = (items: RepositoryFile[]) => {
      return items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) {return -1;}
        if (!a.isDirectory && b.isDirectory) {return 1;}
        return a.name.localeCompare(b.name);
      });
    };

    const sortTree = (items: RepositoryFile[]): RepositoryFile[] => {
      return sortItems(items).map(item => ({
        ...item,
        children: item.children ? sortTree(item.children) : undefined
      }));
    };

    return sortTree(tree);
  };

  const fileTree = buildFileTree();

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Branch selector */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedBranch} onValueChange={onBranchChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {repository.branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.name}>
                  {branch.name} {branch.isDefault && '(default)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-muted-foreground">
          {repository.files.length} files
        </span>
      </div>

      {/* File tree */}
      <Card className="flex-1 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Files</h3>
            <Button variant="outline" size="sm">
              Add File
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto h-full">
            {fileTree.length > 0 ? (
              <div className="p-2">
                {fileTree.map(file => renderFileTreeItem(file))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No files in this repository yet.</p>
                <Button variant="outline" size="sm" className="mt-4">
                  Create your first file
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Repository info */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Owner:</span>
                <span className="font-medium">{currentUser.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDate(repository.createdAt)}</span>
              </div>
            </div>
            <div className="text-muted-foreground">
              Last updated {formatDate(repository.updatedAt)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}