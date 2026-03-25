import json

with open('/home/ubuntu/.local/share/opencode/tool-output/tool_d1037961f001T08P3F2f4Oh7Ku', 'r') as f:
    data = json.load(f)
content = data['src/frontend/src/App.tsx']['content']

# 1. Add Share2 to lucide imports
content = content.replace('  Star,\n', '  Share2,\n  Star,\n', 1)

# 2. Add onShare to ContentCard props
content = content.replace(
    '  onCopy,\n  cardKey,\n}: {\n  item: Dare;\n  type: ContentType;\n  category: string;\n  onNew: () => void;\n  onNextPlayer: () => void;\n  onFavoriteToggle: () => void;\n  isFavorited: boolean;\n  onCopy: () => void;\n  cardKey: number;\n})',
    '  onCopy,\n  onShare,\n  cardKey,\n}: {\n  item: Dare;\n  type: ContentType;\n  category: string;\n  onNew: () => void;\n  onNextPlayer: () => void;\n  onFavoriteToggle: () => void;\n  isFavorited: boolean;\n  onCopy: () => void;\n  onShare: () => void;\n  cardKey: number;\n})',
    1
)

# 3. Add Share button inside ContentCard after buttons row
SHARE_BTN = (
    '\n\n          {/* Share this dare */}\n'
    '          <motion.button\n'
    '            type="button"\n'
    '            whileTap={{ scale: 0.96 }}\n'
    '            whileHover={{ scale: 1.02 }}\n'
    '            onClick={onShare}\n'
    '            data-ocid="content.share.button"\n'
    '            className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 border-2 transition-all"\n'
    '            style={{\n'
    '              background: "linear-gradient(135deg, oklch(0.22 0.06 290 / 0.8), oklch(0.22 0.06 15 / 0.8))",\n'
    '              borderColor: "oklch(0.65 0.22 290)",\n'
    '              color: "oklch(0.85 0.18 290)",\n'
    '            }}\n'
    '          >\n'
    '            <Share2 className="w-4 h-4" />\n'
    '            Share this\n'
    '          </motion.button>'
)

content = content.replace(
    '              New {cfg.label}\n            </Button>\n          </div>\n        </div>\n      </div>\n\n      {/* Next Player button */}',
    '              New {cfg.label}\n            </Button>\n          </div>' + SHARE_BTN + '\n        </div>\n      </div>\n\n      {/* Next Player button */}',
    1
)

# 4. Add sharePrompt callback before handleFavoriteToggle
SHARE_FN = (
    '  const sharePrompt = useCallback(async (item: Dare, type: ContentType) => {\n'
    "    const label = type === \"truth\" ? \"Truth\" : type === \"dare\" ? \"Dared\" : \"Situation'd\";\n"
    '    const shareText = `I just got ${label}: "${item.dare}" on DareMe \U0001f480 Think you can handle this? #DareMe`;\n'
    '    if (navigator.share) {\n'
    '      try {\n'
    '        await navigator.share({ title: "DareMe", text: shareText });\n'
    '      } catch (_) {}\n'
    '    } else {\n'
    '      navigator.clipboard.writeText(shareText).then(() => {\n'
    '        toast.success("Copied to clipboard! \U0001f4cb");\n'
    '      });\n'
    '    }\n'
    '  }, []);\n\n'
)

content = content.replace(
    '  const handleFavoriteToggle = useCallback(() => {',
    SHARE_FN + '  const handleFavoriteToggle = useCallback(() => {',
    1
)

# 5. Wire onShare in ContentCard usage
content = content.replace(
    '                    onCopy={() => copyCaption(currentItem)}\n                    cardKey={itemKey}',
    '                    onCopy={() => copyCaption(currentItem)}\n                    onShare={() => sharePrompt(currentItem, contentType)}\n                    cardKey={itemKey}',
    1
)

# 6. Improve EndGame share text using regex
import re
content = re.sub(
    r"const text = `\$\{winner\.name\} won DareMe with \$\{winner\.score\.toFixed\(1\)\} points! .+?`;",
    (
        'const topScores = sorted\n'
        '      .slice(0, 5)\n'
        '      .map((p, i) => `${i === 0 ? "\U0001f451" : `${i + 1}.`} ${p.name}: ${p.score.toFixed(1)} pts`)\n'
        '      .join("\\n");\n'
        '    const text = `\U0001f451 ${winner.name} won DareMe with ${winner.score.toFixed(1)} pts! \U0001f389\\n\\nTop scores:\\n${topScores}\\n\\nThink you can beat them? Play DareMe! #DareMe`;'
    ),
    content,
    count=1
)

# 7. Make EndGame share button gradient
old7_a = '          className="w-full py-4 rounded-full font-black text-lg flex items-center justify-center gap-3 border-2 text-foreground"'
old7_b = '            borderColor: "oklch(0.85 0.18 85)",'
if old7_a in content and old7_b in content:
    content = content.replace(
        old7_a + '\n          style={{\n' + old7_b + '\n            color: "oklch(0.85 0.18 85)",\n          }}\n        >\n          Share Results \U0001f4e4',
        '          className="w-full py-4 rounded-full font-black text-lg flex items-center justify-center gap-3 text-white"\n          style={{\n            background: "linear-gradient(135deg, oklch(0.55 0.22 85), oklch(0.65 0.25 55))",\n            boxShadow: "0 0 24px oklch(0.55 0.22 85 / 0.5)",\n          }}\n        >\n          <Share2 className="w-5 h-5" />\n          Share Results \U0001f4e4',
        1
    )
    print('EndGame button: replaced')
else:
    print('EndGame button: NOT FOUND')
    print('  a:', old7_a in content)
    print('  b:', old7_b in content)

with open('src/frontend/src/App.tsx', 'w') as f:
    f.write(content)

print(f'Done! {len(content)} chars, {content.count(chr(10))} lines')
checks = [
    ('Share2 import', '  Share2,'),
    ('onShare prop', 'onShare: () => void;'),
    ('sharePrompt fn', 'sharePrompt = useCallback'),
    ('onShare wired', 'onShare={() => sharePrompt'),
    ('Share button in card', 'data-ocid="content.share.button"'),
    ('EndGame gradient', 'oklch(0.55 0.22 85)'),
    ('EndGame topScores', 'topScores'),
]
for name, pattern in checks:
    print(f"  {'OK' if pattern in content else 'MISSING'} {name}")
