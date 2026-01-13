import { NextResponse } from "next/server";

// Exemplo: fotos armazenadas no Cloudinary
const fotos = [
  { id: "1", url: "https://res.cloudinary.com/wilfront/image/upload/v169xxxx/foto1.jpg" },
  { id: "2", url: "https://res.cloudinary.com/wilfront/image/upload/v169xxxx/foto2.jpg" },
  // ...adicione mais ou busque dinamicamente do seu banco/Cloudinary
];

export async function GET() {
  return NextResponse.json(fotos);
}
