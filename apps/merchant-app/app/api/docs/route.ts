import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { NextResponse } from 'next/server';

export async function GET() {
  const filePath = path.join(process.cwd(), '../../packages/docs/swagger.merchant-app.yaml');
  const spec = yaml.load(fs.readFileSync(filePath, 'utf8'));
  return NextResponse.json(spec);
}
