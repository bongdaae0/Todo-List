"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTodos, createTodo, updateTodo, TodoItem } from "@/lib/api";

export default function HomePage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 초기 할 일 목록 불러오기
  useEffect(() => {
    let isMounted = true;

    async function loadTodos() {
      try {
        const data = await getTodos();
        if (isMounted) setTodos(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadTodos();
    return () => {
      isMounted = false;
    };
  }, []);

  // 새 할 일 등록 (버튼 클릭 및 Enter 키)
  const handleAddTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const newTodo = await createTodo(trimmed);
      setTodos((prev) => [newTodo, ...prev]);
      setInputText("");
    } catch (error) {
      alert("할 일 추가에 실패했습니다.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 체크박스 클릭 시 TO DO <-> DONE 상태 토글
  const handleToggleComplete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    item: TodoItem,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const nextStatus = !item.isCompleted;
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === item.id ? { ...todo, isCompleted: nextStatus } : todo,
      ),
    );

    try {
      await updateTodo(item.id, { isCompleted: nextStatus });
    } catch {
      // 실패 시 원래 상태로 롤백
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === item.id
            ? { ...todo, isCompleted: item.isCompleted }
            : todo,
        ),
      );
      alert("상태 변경에 실패했습니다.");
    }
  };

  const ongoingTodos = todos.filter((item) => !item.isCompleted);
  const completedTodos = todos.filter((item) => item.isCompleted);

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      {/* 상단 검색/입력 영역 */}
      <form
        onSubmit={handleAddTodo}
        className="flex items-center gap-2 sm:gap-4"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="할 일을 입력해주세요"
            className="w-full h-[52px] px-6 rounded-full bg-slate-100 border-2 border-slate-900 text-slate-900 placeholder:text-slate-500 text-base outline-none shadow-[3px_3px_0px_#0F172A] focus:bg-white transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`h-[52px] px-5 sm:px-9 rounded-full border-2 border-slate-900 font-bold text-base flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#0F172A] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer ${
            ongoingTodos.length === 0 && inputText.trim().length > 0
              ? "bg-violet-600 text-white"
              : "bg-slate-200 text-slate-900 hover:bg-violet-600 hover:text-white"
          }`}
        >
          <span className="text-xl leading-none font-normal">+</span>
          <span className="hidden sm:inline">추가하기</span>
        </button>
      </form>

      {/* 하단 TO DO / DONE 2열 그리드 (데스크탑 2열, 태블릿/모바일 1열) */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          목록을 불러오는 중...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6">
          {/* TO DO 영역 */}
          <section className="flex flex-col gap-4">
            <div>
              <span className="inline-block px-7 py-1.5 rounded-full bg-lime-300 text-green-800 font-extrabold text-sm tracking-wide">
                TO DO
              </span>
            </div>

            {ongoingTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <img
                  src="/images/empty-todo.svg"
                  alt="할 일 없음"
                  className="w-44 sm:w-60 h-auto mb-4"
                />
                <p className="text-slate-400 text-base leading-relaxed">
                  할 일이 없어요.
                  <br />
                  TODO를 새롭게 추가해주세요!
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {ongoingTodos.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/items/${item.id}`}
                      className="flex items-center gap-4 px-4 h-[50px] rounded-full bg-white border-2 border-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={(e) => handleToggleComplete(e, item)}
                        aria-label="완료로 변경"
                        className="w-8 h-8 rounded-full border-2 border-slate-900 bg-[#FEFCE8] flex-shrink-0 cursor-pointer"
                      />
                      <span className="text-slate-800 text-base truncate">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* DONE 영역 */}
          <section className="flex flex-col gap-4">
            <div>
              <span className="inline-block px-7 py-1.5 rounded-full bg-green-700 text-amber-300 font-extrabold text-sm tracking-wide">
                DONE
              </span>
            </div>

            {completedTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <img
                  src="/images/empty-done.svg"
                  alt="완료된 일 없음"
                  className="w-44 sm:w-60 h-auto mb-4"
                />
                <p className="text-slate-400 text-base leading-relaxed">
                  아직 다 한 일이 없어요.
                  <br />
                  해야 할 일을 체크해보세요!
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {completedTodos.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/items/${item.id}`}
                      className="flex items-center gap-4 px-4 h-[50px] rounded-full bg-violet-100 border-2 border-slate-900 hover:opacity-90 transition-opacity"
                    >
                      <button
                        type="button"
                        onClick={(e) => handleToggleComplete(e, item)}
                        aria-label="진행 중으로 변경"
                        className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white flex-shrink-0 cursor-pointer"
                      >
                        ✓
                      </button>
                      <span className="text-slate-800 text-base line-through truncate">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
