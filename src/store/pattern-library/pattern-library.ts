import { Box, Page, Placeholder, Text } from './builtins';
import * as Fuse from 'fuse.js';
import { Pattern, PatternFolder, SyntheticPatternType } from '../pattern';
import { PatternProperty, PatternPropertyType } from '../pattern-property';
import * as Types from '../types';
import * as uuid from 'uuid';

// tslint:disable-next-line:no-duplicate-imports
import * as P from '../pattern-property';

export interface PatternLibraryInit {
	id: string;
	patternProperties: PatternProperty[];
	patterns: Pattern[];
	root?: PatternFolder;
}

export class PatternLibrary {
	private fuse: Fuse;
	private id: string;
	private patternProperties: PatternProperty[] = [];
	private patterns: Pattern[] = [];
	private root: PatternFolder;

	public constructor(init: PatternLibraryInit) {
		this.id = init.id || uuid.v4();
		this.patterns = init.patterns;
		this.patternProperties = init.patternProperties;

		if (init.root) {
			this.root = init.root;
			this.updateSearch();
		}
	}

	public static create(): PatternLibrary {
		const patternLibrary = new PatternLibrary({
			id: uuid.v4(),
			patterns: [],
			patternProperties: []
		});

		const root = new PatternFolder({ name: 'root' }, { patternLibrary });
		patternLibrary.setRootFolder(root);

		const syntheticFolder = new PatternFolder(
			{
				name: 'Synthetic',
				parent: root
			},
			{ patternLibrary }
		);

		const { pagePattern, pageProperties } = Page({ patternLibrary });
		const { placeholderPattern, placeholderProperties } = Placeholder({ patternLibrary });
		const { textPattern, textProperties } = Text({ patternLibrary });
		const { boxPattern, boxProperties } = Box({ patternLibrary });

		syntheticFolder.addPattern(textPattern);
		syntheticFolder.addPattern(boxPattern);
		syntheticFolder.addPattern(placeholderPattern);

		[pagePattern, textPattern, boxPattern, placeholderPattern].forEach(pattern => {
			patternLibrary.addPattern(pattern);
		});

		[...pageProperties, ...placeholderProperties, ...textProperties, ...boxProperties].forEach(
			property => {
				patternLibrary.addProperty(property);
			}
		);

		return patternLibrary;
	}

	public static from(serialized: Types.SerializedPatternLibrary): PatternLibrary {
		const patternLibrary = new PatternLibrary({
			id: serialized.id,
			patterns: [],
			patternProperties: serialized.patternProperties.map(deserializeProperty)
		});

		patternLibrary.setRootFolder(PatternFolder.from(serialized.root, { patternLibrary }));

		serialized.patterns.forEach(pattern => {
			patternLibrary.addPattern(Pattern.from(pattern, { patternLibrary }));
		});

		return patternLibrary;
	}

	public addPattern(pattern: Pattern): void {
		this.patterns.push(pattern);
		this.updateSearch();
	}

	public addProperty(property: PatternProperty): void {
		this.patternProperties.push(property);
	}

	public getPatternById(id: string): Pattern | undefined {
		return this.patterns.find(pattern => pattern.getId() === id);
	}

	public getPatternByType(type: SyntheticPatternType): Pattern {
		return this.patterns.find(pattern => pattern.getType() === type) as Pattern;
	}

	public getPatternPropertyById(id: string): PatternProperty | undefined {
		return this.patternProperties.find(patternProperty => patternProperty.getId() === id);
	}

	public getPatterns(): Pattern[] {
		return this.patterns;
	}

	public getRoot(): PatternFolder {
		return this.root;
	}

	public query(term: string): string[] {
		if (term.trim().length === 0) {
			return this.root.getDescendants().map(item => item.getId());
		}

		return this.fuse
			.search<Types.SerializedPattern | Types.SerializedPatternFolder>(term)
			.map(match => match.id);
	}

	public setRootFolder(root: PatternFolder): void {
		this.root = root;
	}

	public toJSON(): Types.SerializedPatternLibrary {
		return {
			id: this.id,
			patterns: this.patterns.map(p => p.toJSON()),
			patternProperties: this.patternProperties.map(p => p.toJSON()),
			root: this.root.toJSON()
		};
	}

	public updateSearch(): void {
		const registry = this.root.getDescendants().map(item => item.toJSON());

		this.fuse = new Fuse(registry, {
			keys: ['name']
		});
	}
}

function deserializeProperty(input: Types.SerializedPatternProperty): PatternProperty {
	switch (input.type) {
		case PatternPropertyType.Asset:
			return P.PatternAssetProperty.from(input);
		case PatternPropertyType.Boolean:
			return P.PatternBooleanProperty.from(input);
		case PatternPropertyType.Enum:
			return P.PatternEnumProperty.from(input);
		case PatternPropertyType.Number:
			return P.PatternNumberProperty.from(input);
		case PatternPropertyType.NumberArray:
			return P.PatternNumberArrayProperty.from(input);
		case PatternPropertyType.Object:
			return P.PatternObjectProperty.from(input);
		case PatternPropertyType.String:
			return P.PatternStringProperty.from(input);
		case PatternPropertyType.StringArray:
			return P.StringPatternArrayProperty.from(input);
		default:
			console.warn(`Tried to deserialize unknown property: ${JSON.stringify(input)}`);
			return P.PatternStringProperty.from(input);
	}
}
