import ignore_files from '../ignore_files.json';
import path from 'path';
import fs from 'fs';

export const template_path = path.resolve(__dirname, '..', '..', 'react-nodegui-template');

function copyFolder(folder_path: string, dest_path: string) {
  const files = fs.readdirSync(
    folder_path,
    {
      recursive: false,
      withFileTypes: true,
    },
  );

  for (const file of files) {
    const file_path = path.resolve(file.parentPath, file.name);
    const dest_file_path = path.resolve(dest_path, file.name);

    if (ignore_files.includes(file.name)) {
      continue;
    }

    if (file.isDirectory()) {
      fs.mkdirSync(dest_file_path);

      copyFolder(
        file_path,
        dest_file_path,
      );
      
      continue;
    }

    fs.copyFileSync(
      file_path,
      dest_file_path,
    );
  }
}

export function copyTemplate(project_path: string) {
  copyFolder(template_path, project_path);
}