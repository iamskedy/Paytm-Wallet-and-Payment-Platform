import YAML from 'yamljs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const spec = YAML.load(
    path.join(process.cwd(), '../../packages/docs/swagger.user-app.yaml')
  );
  return NextResponse.json(spec);
}