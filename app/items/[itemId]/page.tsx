"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTodoDetail, updateTodo, deleteTodo, uploadImage } from "@/lib/api";

export default function TodoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = Number(params.itemId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [memo, setMemo] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 상세 정보 불러오기
  useEffect(() => {
    if (!itemId) return;
    const fetchDetail = async () => {
      try {
        const data = await getTodoDetail(itemId);
        setName(data.name || "");
        setIsCompleted(Boolean(data.isCompleted));
        setMemo(data.memo || "");
        setImageUrl(data.imageUrl || "");
      } catch (error) {
        alert("할 일 정보를 불러오지 못했습니다.");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [itemId, router]);

  // 이미지 선택 및 유효성 검사 (영어 파일명 + 5MB 이하)
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1) 영어 파일명 검증 (확장자 제외 영어 알파벳만 허용)
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const isEnglishOnly = /^[a-zA-Z]+$/.test(fileNameWithoutExt);
    if (!isEnglishOnly) {
      alert("이미지 파일 이름은 영어로만 이루어져야 합니다. (예: photo.png)");
      e.target.value = "";
      return;
    }

    // 2) 파일 크기 5MB 이하 검증
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("이미지 파일 크기는 5MB 이하여야 합니다.");
      e.target.value = "";
      return;
    }

    try {
      const uploadedUrl = await uploadImage(file);
      setImageUrl(uploadedUrl);
    } catch (error) {
      alert("이미지 업로드에 실패했습니다.");
      console.error(error);
    }
  };

  // 수정 완료 버튼 클릭
  const handleSave = async () => {
    if (!name.trim()) {
      alert("할 일 제목을 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);
      await updateTodo(itemId, {
        name: name.trim(),
        memo,
        imageUrl,
        isCompleted,
      });
      router.push("/");
    } catch (error) {
      alert("수정에 실패했습니다.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // 삭제하기 버튼 클릭
  const handleDelete = async () => {
    if (!confirm("정말 이 할 일을 삭제하시겠습니까?")) return;

    try {
      await deleteTodo(itemId);
      router.push("/");
    } catch (error) {
      alert("삭제에 실패했습니다.");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">불러오는 중...</div>
    );
  }

  return (
    <div className="bg-white min-h-[calc(100vh-108px)] px-4 sm:px-10 lg:px-24 py-6 rounded-2xl flex flex-col gap-6">
      {/* 상단 제목 & 완료 토글 바 */}
      <div
        className={`w-full h-[64px] px-4 rounded-3xl border-2 border-slate-900 flex items-center justify-center gap-4 transition-colors ${
          isCompleted ? "bg-violet-100" : "bg-white"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsCompleted((prev) => !prev)}
          aria-label="완료 상태 변경"
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer ${
            isCompleted
              ? "bg-violet-600 text-white"
              : "border-2 border-slate-900 bg-[#FEFCE8]"
          }`}
        >
          {isCompleted && "✓"}
        </button>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-transparent text-slate-900 font-bold text-xl underline outline-none text-center w-full max-w-md"
        />
      </div>

      {/* 중간 이미지 첨부 & 메모 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 이미지 업로드 박스 (왼쪽 5칸) */}
        <div className="lg:col-span-5 relative h-[311px] rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="첨부 이미지"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-slate-300">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="이미지 첨부 또는 수정"
            className={`absolute bottom-4 right-4 w-16 h-16 rounded-full flex items-center justify-center text-2xl cursor-pointer transition-colors ${
              imageUrl
                ? "bg-slate-900/50 border-2 border-slate-900 text-white"
                : "bg-slate-200 text-slate-500 hover:bg-slate-300"
            }`}
          >
            {imageUrl ? "✎" : "+"}
          </button>
        </div>

        {/* 메모 작성 박스 (오른쪽 7칸) */}
        <div
          className="lg:col-span-7 h-[311px] rounded-3xl p-6 flex flex-col items-center bg-cover bg-center border border-amber-100"
          style={{ backgroundImage: "url('/images/memo-bg.svg')" }}
        >
          <span className="text-amber-800 font-extrabold text-base mb-4">
            Memo
          </span>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력해주세요."
            className="w-full flex-1 bg-transparent resize-none outline-none text-slate-800 text-base text-center leading-8"
          />
        </div>
      </div>

      {/* 하단 수정 완료 / 삭제하기 버튼 */}
      <div className="flex items-center justify-center lg:justify-end gap-4 mt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`w-[168px] h-[52px] rounded-full border-2 border-slate-900 font-bold text-base flex items-center justify-center gap-2 shadow-[3px_3px_0px_#0F172A] cursor-pointer transition-colors ${
            imageUrl || memo.trim().length > 0
              ? "bg-lime-300 text-slate-900"
              : "bg-slate-200 text-slate-900 hover:bg-lime-300"
          }`}
        >
          <span>✓</span>
          <span>수정 완료</span>
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="w-[168px] h-[52px] rounded-full bg-rose-500 text-white border-2 border-slate-900 font-bold text-base flex items-center justify-center gap-2 shadow-[3px_3px_0px_#0F172A] cursor-pointer hover:opacity-90 transition-opacity"
        >
          <span>✕</span>
          <span>삭제하기</span>
        </button>
      </div>
    </div>
  );
}
