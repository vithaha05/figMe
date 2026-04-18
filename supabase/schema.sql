CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Untitled',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  canvas_state JSONB,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE document_collaborators (
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',
  PRIMARY KEY (document_id, user_id)
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_access" ON documents
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "collaborator_read" ON documents
  FOR SELECT USING (
    id IN (
      SELECT document_id FROM document_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "collaborator_access" ON document_collaborators
  FOR ALL USING (
    user_id = auth.uid() OR 
    document_id IN (
      SELECT id FROM documents WHERE owner_id = auth.uid()
    )
  );

CREATE INDEX idx_documents_owner_id ON documents(owner_id);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_collaborators_user_id ON document_collaborators(user_id);
