import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Linkedin, Sparkles, Copy, Check, BookmarkCheck, Clock, ChevronDown, ChevronUp } from "lucide-react";

const TONES = [
  {
    key: "mcconaughey",
    label: "McConaughey",
    desc: "Cinematic. Philosophical. Unhurried.",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    key: "direct",
    label: "Direct",
    desc: "No-BS. Blunt. Contractor-to-contractor.",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    key: "story",
    label: "Story",
    desc: "One job. One moment. One lesson.",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    key: "provocative",
    label: "Provocative",
    desc: "Controversial. Makes them stop scrolling.",
    color: "bg-red-100 text-red-800 border-red-200",
  },
] as const;

type Tone = (typeof TONES)[number]["key"];

export default function LinkedInPosts() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("mcconaughey");
  const [generatedPosts, setGeneratedPosts] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const generateMutation = trpc.linkedin.generatePosts.useMutation({
    onSuccess: (data) => {
      setGeneratedPosts(data.posts);
      setCurrentId(data.id);
      setSavedIndex(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const saveMutation = trpc.linkedin.savePost.useMutation({
    onSuccess: () => toast.success("Post saved to your library!"),
    onError: (err) => toast.error(err.message),
  });

  const { data: history, refetch: refetchHistory } = trpc.linkedin.getMyPosts.useQuery(undefined, {
    enabled: showHistory,
  });

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error("Enter a topic first");
      return;
    }
    setGeneratedPosts([]);
    generateMutation.mutate({ topic: topic.trim(), tone });
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSave = (text: string, index: number) => {
    if (!currentId) return;
    saveMutation.mutate({ id: currentId, savedPost: text });
    setSavedIndex(index);
    refetchHistory();
  };

  const TOPIC_STARTERS = [
    "Storm season is here",
    "Adjusters lowball estimates",
    "Most contractors miss $10K per job",
    "Why I got into roofing supplements",
    "What happens after a hail storm",
    "The truth about insurance claims",
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A66C2] flex items-center justify-center">
            <Linkedin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LinkedIn Post Generator</h1>
            <p className="text-sm text-gray-500">McConaughey-style posts that make contractors stop scrolling</p>
          </div>
        </div>

        {/* Tone selector */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Choose your voice</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {TONES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTone(t.key)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  tone === t.key
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white hover:border-gray-400"
                }`}
              >
                <div className="font-semibold text-sm">{t.label}</div>
                <div className={`text-xs mt-0.5 ${tone === t.key ? "text-gray-300" : "text-gray-500"}`}>
                  {t.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Topic input */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">What do you want to post about?</p>
          <Textarea
            placeholder="e.g. Most roofing contractors leave $10K on the table after every storm job..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            className="resize-none text-base"
          />
          {/* Quick starters */}
          <div className="flex flex-wrap gap-2 mt-2">
            {TOPIC_STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => setTopic(s)}
                className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={generateMutation.isPending || !topic.trim()}
          className="w-full h-12 text-base bg-gray-900 hover:bg-gray-800 text-white"
        >
          {generateMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Writing your posts...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generate 3 Posts
            </span>
          )}
        </Button>

        {/* Generated posts */}
        {generatedPosts.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">
              Pick the one that hits — copy it and post it on LinkedIn
            </p>
            {generatedPosts.map((post, i) => (
              <Card
                key={i}
                className={`border-2 transition-all ${
                  savedIndex === i ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2 mb-3">
                    <Badge variant="outline" className="text-xs shrink-0">
                      Option {i + 1}
                    </Badge>
                    {savedIndex === i && (
                      <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                        Saved
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">{post}</p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(post, i)}
                      className="flex items-center gap-1.5"
                    >
                      {copiedIndex === i ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSave(post, i)}
                      disabled={saveMutation.isPending || savedIndex !== null}
                      className="flex items-center gap-1.5"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      Save to Library
                    </Button>
                    <a
                      href="https://www.linkedin.com/feed/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto"
                    >
                      <Button
                        size="sm"
                        className="bg-[#0A66C2] hover:bg-[#004182] text-white flex items-center gap-1.5"
                        onClick={() => handleCopy(post, i)}
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        Post on LinkedIn
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Post history */}
        <div className="border-t pt-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Post History
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHistory && history && (
            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No posts generated yet.</p>
              ) : (
                history.map((item) => (
                  <Card key={item.id} className="border border-gray-100">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-700">
                          {item.topic}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.tone}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    {item.savedPost && (
                      <CardContent className="px-4 pb-3">
                        <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-3">
                          {item.savedPost}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 h-7 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(item.savedPost!);
                            toast.success("Copied!");
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy saved post
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
