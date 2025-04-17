import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function Home() {
  const [formData, setFormData] = useState({
    field: '',
    major: '',
    certificate: '',
    strength: '',
    experience: '',
    contribution: '',
    style: {
      logical: false,
      emotional: false,
      creative: false
    },
    extra: ''
  });

  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isAdmin, setIsAdmin] = useState(true);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name in formData.style) {
      setFormData(prev => ({
        ...prev,
        style: { ...prev.style, [name]: checked }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const generateSelfIntro = async () => {
    if (!apiKey) {
      alert("API 키를 입력해주세요 (관리자 설정 필요)");
      return;
    }

    setLoading(true);

    const prompt = `너는 자기소개서 전문 컨설턴트야. 아래 정보를 바탕으로 고퀄 자기소개서를 써줘:\n
지원 분야: ${formData.field}\n전공: ${formData.major}\n자격증: ${formData.certificate}\n성격적 장점: ${formData.strength}\n기억에 남는 활동: ${formData.experience}\n기여할 수 있는 점: ${formData.contribution}\n스타일: ${Object.entries(formData.style).filter(([_, v]) => v).map(([k]) => k).join(', ')}\n기타 참고 내용: ${formData.extra}\n
글은 자연스럽고 논리적이며, 도입-전개-마무리 구조로 써줘. 길이는 약 700자.`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "너는 자기소개서 전문가야." },
            { role: "user", content: prompt }
          ]
        })
      });

      const data = await response.json();
      const aiText = data.choices[0]?.message?.content || "자기소개서를 생성하는 데 실패했습니다.";
      setResult(aiText + "\n\n※ 위 자기소개서는 참고용으로 생성된 예시이며, 실제 제출 시에는 개인 상황에 맞게 수정이 필요합니다.");
    } catch (error) {
      setResult("자기소개서를 생성하는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-center">AI 자기소개서 도우미</h1>

      {isAdmin && (
        <Card>
          <CardContent className="space-y-3 pt-4">
            <Input
              placeholder="OpenAI API 키 입력 (관리자용)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-3 pt-4">
          <Input name="field" placeholder="지원 분야 (예: 마케팅, 개발자 등)" onChange={handleChange} />
          <Input name="major" placeholder="전공/학과" onChange={handleChange} />
          <Input name="certificate" placeholder="자격증 (예: 컴활 1급)" onChange={handleChange} />
          <Input name="strength" placeholder="성격적 장점" onChange={handleChange} />
          <Textarea name="experience" placeholder="기억에 남는 활동" onChange={handleChange} />
          <Textarea name="contribution" placeholder="회사에 기여할 수 있는 점" onChange={handleChange} />
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <Checkbox name="logical" onCheckedChange={(checked) => handleChange({ target: { name: 'logical', checked } })} /> 진중함
            </label>
            <label className="flex items-center gap-2">
              <Checkbox name="emotional" onCheckedChange={(checked) => handleChange({ target: { name: 'emotional', checked } })} /> 감성적
            </label>
            <label className="flex items-center gap-2">
              <Checkbox name="creative" onCheckedChange={(checked) => handleChange({ target: { name: 'creative', checked } })} /> 창의적
            </label>
          </div>
          <Textarea name="extra" placeholder="기타 자유 입력 내용" onChange={handleChange} />
          <Button onClick={generateSelfIntro} disabled={loading}>
            {loading ? '생성 중...' : '자기소개서 생성하기'}
          </Button>
        </CardContent>
      </Card>
      {result && (
        <Card>
          <CardContent className="pt-4 whitespace-pre-wrap">{result}</CardContent>
        </Card>
      )}
      <footer className="text-center text-sm text-gray-500 pt-4 border-t">
        ※ 본 서비스는 AI를 활용한 자기소개서 생성 도구입니다. 생성된 내용은 참고용이며, 사용자의 책임 하에 활용해주세요.
      </footer>
    </div>
  );
}
