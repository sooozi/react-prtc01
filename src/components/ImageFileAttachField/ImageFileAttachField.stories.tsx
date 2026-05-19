import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { ImageFileAttachField } from './ImageFileAttachField';
import type { FileWithId, ImageFileUnifiedRow } from './types';
import { filesToItemsWithIds } from './lib/fileAttachItemUtils';

const meta = {
  title: 'Components/ImageFileAttachField',
  component: ImageFileAttachField,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ImageFileAttachField>;

export default meta;
type Story = StoryObj<typeof meta>;

function CreateDemo() {
  const [items, setItems] = useState<FileWithId[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <ImageFileAttachField
      fileInputId="storybook-attach-create"
      fileInputRef={fileInputRef}
      items={items}
      onChange={setItems}
    />
  );
}

function CreateWithFilesDemo() {
  const [items, setItems] = useState<FileWithId[]>(() => {
    const file = new File([''], 'sample-photo.jpg', { type: 'image/jpeg' });
    return filesToItemsWithIds([file]);
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <ImageFileAttachField
      fileInputId="storybook-attach-filled"
      fileInputRef={fileInputRef}
      items={items}
      onChange={setItems}
    />
  );
}

function UnifiedEditDemo() {
  const [rows, setRows] = useState<ImageFileUnifiedRow[]>([
    { kind: 'server', fileId: 101, name: 'existing-cover.png', sizeBytes: 204_800 },
    { kind: 'server', fileId: 102, name: 'diagram.webp', sizeBytes: 51_200 },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <ImageFileAttachField
      fileInputId="storybook-attach-unified"
      fileInputRef={fileInputRef}
      unifiedRows={rows}
      onUnifiedRowsChange={setRows}
    />
  );
}

export const CreateEmpty: Story = {
  render: () => <CreateDemo />,
};

export const CreateWithFile: Story = {
  render: () => <CreateWithFilesDemo />,
};

export const UnifiedEdit: Story = {
  render: () => <UnifiedEditDemo />,
};
