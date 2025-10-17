# Documentation Guides

This guide explains how to create and maintain documentation for your project using `utopia-project`.

## Overview

There are two main aspects to consider when creating documentation with `utopia-project`:

1. **Source Code Documentation**: This involves adding documentation directly within your code using special tags.
2. **Examples & Guides**: This includes creating separate example files and guides to help users understand how to use your project.

### Source Code Documentation

Source code documentation is included adjacent to the code it describes, using special tags to provide structured information. This allows for easy generation of documentation from the source code itself. The `utopia-project` documentation generator uses the `decode` gem (which is documented elsewhere).

However, in short:

- Documentation is expected to be in markdown format.
- You may embed links to definitions using `{MyClass}` or `{my_method}`.
- You can use tags:
  - `@parameters name [Type] Description.`
  - `@yields {|argument| ...} If a block is given.`
  - `@returns [Type] Description.`
- Classes and Modules should typically be described as "Represents a ..." where it makes sense to do so.

In addition, for complex classes that require extra documentation, e.g. `my_class.rb` can have an adjacent `my_class.md` which should have the title `# MyClass` and can include additional details, examples, and usage guidelines.

### Examples & Guides

In addition to source code documentation, it's helpful to provide separate examples and guides to demonstrate how to use your project. This can include:

- Code snippets that illustrate common use cases.
- Step-by-step tutorials for more complex scenarios.

By providing both inline documentation and separate guides, you can help users understand your project more easily and encourage adoption.

These resources are located in the `guides/` directory of your project, and have the following format:

```
guides/
├── links.yaml
├── documentation-guidelines/
│   └── readme.md
├── documentation-guides/
│   └── readme.md
├── getting-started/
│   └── readme.md
└── github-pages-integration/
    └── readme.md
```

The `links.yaml` file comes from the `utopia` framework, and is used to define metadata and ordering of the guides, e.g.

```yaml
# guides/links.yaml
getting-started:
  order: 1
github-pages-integration:
  order: 2
documentation-guides:
  order: 3
```

Every guide should start with a brief overview, explaining its purpose and what the user can expect to learn: "This guide explains how to use x to do y." – it should be short and to the point, as it's used as the description of the guide on other pages that link to it.

## Guide Writing Principles

### Context Before Implementation

Every feature or concept should be introduced with clear context about why users need it before explaining how to use it. This helps users understand when and why to apply the feature in their own projects.

**Structure each section as:**
1. **Problem statement**: What challenge does this solve?
2. **Use cases**: When would users encounter this need?
3. **Solution overview**: How does this feature address the problem?
4. **Implementation**: Code examples and detailed usage

**Example:**

❌ **Poor context**:
~~~markdown
## Transactions

Use MULTI and EXEC to run commands atomically:

```ruby
client.multi
client.set("key", "value")
client.exec
```
~~~

✅ **Good context**:
~~~markdown
## Transactions

When multiple clients modify the same data simultaneously, you need to prevent race conditions and ensure data consistency. Redis transactions solve this by executing multiple commands atomically - either all succeed or none do.

Use transactions when you need:
- **Data consistency**: Keep related fields synchronized
- **Atomic updates**: Prevent partial updates that could corrupt data
- **Race condition prevention**: Ensure operations complete without interference

```ruby
client.multi
client.set("user:balance", new_balance)
client.set("user:last_transaction", transaction_id)
client.exec
```
~~~

### Advanced Feature Documentation

When documenting advanced features, follow this structure:

1. **Motivation Section**: Start with 2-3 bullet points explaining:
   - What problem this solves
   - When users would need this
   - What happens without this feature

2. **Use Case Examples**: Provide concrete scenarios:
   - Business logic examples (user accounts, inventory, etc.)
   - Technical scenarios (performance, reliability, etc.)
   - Anti-patterns to avoid

3. **Implementation**: Show practical code examples
4. **Best Practices**: When to use vs when not to use
5. **Common Pitfalls**: What to watch out for

**Template:**
```markdown
## [Feature Name]

[Brief explanation of what problem this solves and why it matters]

Use [feature] when you need:
- **[Primary use case]**: [Brief explanation]
- **[Secondary use case]**: [Brief explanation]
- **[Third use case]**: [Brief explanation]

[Implementation examples with practical scenarios]

### Best Practices

[When to use this feature vs alternatives]

### Common Pitfalls

[What to avoid and why]
```

#### "Getting Started" Guide

Every project should have a "Getting Started" guide that provides an introduction to the project, including the following sections:

~~~markdown
# Getting Started

This guide explains how to get started with `$project`.

## Installation

Add the gem to your project:

```bash
$ bundle add $project
```

## Core Concepts

`$project` has several core concepts:

- A {ruby MyProject::MyClass} which represents the main entry point for using the project.

## Usage

Brief explaination about usage.

### Specific Scenario

More detailed explanation about usage in a specific scenario.

```ruby
# some example code
```
~~~

In the above example:

- "Core Concepts" is optional and should be included if it helps to clarify the usage and structure of the project.
- "Specific Scenario" only makes sense if there are more than one scenario that is typical.

## Guide Organization

### Learning Path Structure

Organize guides to follow a natural learning progression:

1. **Core Guides**: Essential concepts all users need
   - Getting Started (installation, basic usage, core concepts)
   - [Primary feature guides in order of typical adoption]

2. **Operational Guides**: Specific use cases and patterns
   - [Advanced features organized by user journey]

3. **Architecture Guides**: System design and scaling decisions
   - [When to use different approaches/clients/patterns]

### Content Depth Guidelines

- **Getting Started**: Cover 80% of what new users need to be productive
- **Feature Guides**: Deep dive into specific capabilities with real-world context
- **Architecture Guides**: Help users make informed decisions between alternatives

Each guide should be self-contained but may reference other guides for deeper context.

### User Journey Considerations

Consider when in a user's journey they'll encounter each feature:

- **Immediate need**: Basic operations, connection management.
- **Growth stage**: Performance optimization, bulk operations.
- **Scale stage**: Clustering, high availability, advanced patterns.

Help users understand when to choose between alternatives:
- Compare approaches side-by-side.
- Explain trade-offs clearly.
- Provide decision criteria.
- Include performance implications.

## Code Examples in Guides

### Contextual Examples

Every code example should demonstrate a realistic scenario, not abstract operations:

❌ **Abstract**:
```ruby
client.set("key", "value")
client.get("key")
```

✅ **Contextual**:
```ruby
# Store user session data:
client.set("session:#{session_id}", user_data.to_json)
client.expire("session:#{session_id}", 3600)

# Retrieve session for authentication:
session_data = client.get("session:#{session_id}")
```

### Comment Style

- **Colon (`:`)**: When comment refers to the next line(s).
- **Period (`.`)**: When comment describes what just happened.
- **No trailing comments**: Avoid end-of-line comments.

### Error Handling

Include proper error handling and resource management in examples:
- Always use `ensure` blocks for cleanup.
- Show common error scenarios.
- Demonstrate graceful degradation patterns.

### Progressive Disclosure

Start with simple examples, then show advanced usage:
1. Basic usage that works immediately.
2. Common configuration options.
3. Advanced patterns and edge cases.
4. Production considerations.

## Enhanced Guide Quality Standards

Following `utopia-project` guidelines, each guide should:

1. **Start with clear purpose**: "This guide explains how to use X to solve Y problem"
2. **Provide user context**: Explain why users would need this feature
3. **Include practical examples**: Working code samples that demonstrate real scenarios
4. **Follow consistent structure**: Problem → Use Cases → Implementation → Best Practices
5. **Cross-reference appropriately**: Use `{ruby ClassName}` for internal references
6. **Include error handling**: Show how to handle common failure scenarios
7. **Provide troubleshooting**: Common issues and solutions
8. **Maintain currency**: Keep examples updated with latest best practices

### Section Checklist

Before publishing a guide section, verify:
- [ ] Explains WHY users need this feature.
- [ ] Provides concrete use cases.
- [ ] Shows realistic code examples.
- [ ] Includes proper error handling.
- [ ] Mentions when NOT to use the feature.
- [ ] References related concepts appropriately.
