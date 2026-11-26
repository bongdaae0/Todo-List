const BASE_URL = "https://assignment-todolist-api.vercel.app/api";
const TENANT_ID = "bongdaae0";

export interface TodoItem {
  id: number;
  tenantId?: string;
  name: string;
  memo?: string | null;
  imageUrl?: string | null;
  isCompleted: boolean;
}

export interface UpdateTodoPayload {
  name?: string;
  memo?: string;
  imageUrl?: string;
  isCompleted?: boolean;
}

/** 1. 할 일 목록 조회 */
export async function getTodos(page = 1, pageSize = 100): Promise<TodoItem[]> {
  const res = await fetch(
    `${BASE_URL}/${TENANT_ID}/items?page=${page}&pageSize=${pageSize}`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error("목록 조회 실패");
  return res.json();
}

/** 2. 할 일 생성 */
export async function createTodo(name: string): Promise<TodoItem> {
  const res = await fetch(`${BASE_URL}/${TENANT_ID}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("할 일 등록 실패");
  return res.json();
}

/** 3. 할 일 상세 조회 */
export async function getTodoDetail(itemId: number): Promise<TodoItem> {
  const res = await fetch(`${BASE_URL}/${TENANT_ID}/items/${itemId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("상세 조회 실패");
  return res.json();
}

/** 4. 할 일 수정 */
export async function updateTodo(
  itemId: number,
  payload: UpdateTodoPayload,
): Promise<TodoItem> {
  const res = await fetch(`${BASE_URL}/${TENANT_ID}/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("할 일 수정 실패");
  return res.json();
}

/** 5. 할 일 삭제 */
export async function deleteTodo(itemId: number): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/${TENANT_ID}/items/${itemId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("할 일 삭제 실패");
  return res.json();
}

/** 6. 이미지 업로드 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${BASE_URL}/${TENANT_ID}/images/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("이미지 업로드 실패");
  const data: { url: string } = await res.json();
  return data.url;
}
