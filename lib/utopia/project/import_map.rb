require "utopia/import_map"

module Utopia
	module Project
		IMPORT_MAP = Utopia::ImportMap.build(base: "/_components/") do |map|
			map.import("mermaid", "./mermaid/mermaid.esm.min.mjs")
			map.import("@socketry/syntax", "./@socketry/syntax/Syntax.js")
		end
	end
end