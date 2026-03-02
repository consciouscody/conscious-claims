import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { BookOpen, Search, Tag, DollarSign, FileText, AlertCircle } from "lucide-react";
import { useState } from "react";

const CATEGORY_COLORS: Record<string, string> = {
  "Roofing Materials": "bg-blue-100 text-blue-800",
  "Flashing": "bg-amber-100 text-amber-800",
  "Underlayment": "bg-green-100 text-green-800",
  "Ventilation": "bg-purple-100 text-purple-800",
  "Labor": "bg-rose-100 text-rose-800",
  "Accessories": "bg-slate-100 text-slate-700",
};

export default function Reference() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: knowledgeBase = [], isLoading } = trpc.supplement.knowledgeBase.useQuery();

  const categories = Array.from(new Set(knowledgeBase.map((item) => item.category)));

  const filtered = knowledgeBase.filter((item) => {
    const matchesSearch =
      !search ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.xactimateCode.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.codeReference?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold">Code Reference Library</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Every commonly missed supplement item — with Xactimate codes, IRC code references, manufacturer requirements, and justification language ready to use in adjuster emails.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by item, code, or IRC reference..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                !selectedCategory
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              All ({knowledgeBase.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {cat} ({knowledgeBase.filter((i) => i.category === cat).length})
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{knowledgeBase.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Items</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{knowledgeBase.filter((i) => i.commonlyMissed).length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Commonly Missed</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{knowledgeBase.filter((i) => i.codeReference).length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">With IRC Code</p>
          </div>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No items match your search</p>
            <p className="text-sm mt-1">Try a different keyword or clear the filter</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((item) => (
              <Card key={item.id} className="border border-border/60 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-mono font-semibold">
                        {item.xactimateCode}
                      </code>
                      <CardTitle className="text-base font-semibold">{item.description}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category] || "bg-slate-100 text-slate-700"}`}>
                        {item.category}
                      </span>
                      {item.commonlyMissed && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Commonly Missed
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Justification */}
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Justification Language</p>
                    <p className="text-sm text-foreground leading-relaxed">{item.justification}</p>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Unit: <span className="font-medium text-foreground">{item.unit}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Est. unit price: <span className="font-medium text-foreground">${item.estimatedUnitPrice.toFixed(2)}</span></span>
                    </div>
                    {item.codeReference && (
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Code: <span className="font-medium text-foreground">{item.codeReference}</span></span>
                      </div>
                    )}
                  </div>

                  {/* Manufacturer reference */}
                  {item.manufacturerReference && (
                    <div className="border-t border-border/40 pt-2">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold">Manufacturer Ref:</span> {item.manufacturerReference}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
