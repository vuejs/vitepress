<!-- https://www.markdownguide.org/basic-syntax -->

# Basic Syntax

## Headings

To create a heading, add number signs (#) in front of a word or phrase. The number of number signs you use should correspond to the heading level. For example, to create a heading level three (`<h3>`), use three number signs (e.g., ### My Header).

# Heading level 1

## Heading level 2

### Heading level 3

#### Heading level 4

##### Heading level 5

###### Heading level 6

* Alternate Syntax:

Heading level 1
===============

Heading level 2
---------------

## Paragraphs

I really like using Markdown.

I think I'll use it to format all of my documents from now on.

## Line Breaks

This is the first line.  
And this is the second line.

First line with the HTML tag after.<br>
And the next line.

## Emphasis

I just love **bold text**.

Love**is**bold

Italicized text is the *cat's meow*.

Italicized text is the _cat's meow_.

A*cat*meow

This text is ***really important***.

This text is ___really important___.

This text is __*really important*__.

This text is **_really important_**.

This is really***very***important text.

## Blockquotes

> Dorothy followed her through many of the beautiful rooms in her castle.

* Blockquotes with Multiple Paragraphs:

> Dorothy followed her through many of the beautiful rooms in her castle.
>
> The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.

* Nested Blockquotes:

> Dorothy followed her through many of the beautiful rooms in her castle.
>
>> The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.

* Blockquotes with Other Elements:

> #### The quarterly results look great!
>
> - Revenue was off the chart.
> - Profits were higher than ever.
>
>  *Everything* is going according to **plan**.

## Lists

1. First item
2. Second item
3. Third item
4. Fourth item

1. First item
1. Second item
1. Third item
1. Fourth item

1. First item
8. Second item
3. Third item
5. Fourth item

1. First item
2. Second item
3. Third item
    1. Indented item
    2. Indented item
4. Fourth item

- First item
- Second item
- Third item
- Fourth item

* First item
* Second item
* Third item
* Fourth item

+ First item
+ Second item
+ Third item
+ Fourth item

- First item
- Second item
- Third item
    - Indented item
    - Indented item
- Fourth item

* Adding Elements in Lists

*   This is the first list item.
*   Here's the second list item.

    I need to add another paragraph below the second list item.

*   And here's the third list item.

*   This is the first list item.
*   Here's the second list item.

    > A blockquote would look great below the second list item.

*   And here's the third list item.

1.  Open the file.
2.  Find the following code block on line 21:

        <html>
          <head>
            <title>Test</title>
          </head>

3.  Update the title to match the name of your website.

1.  Open the file containing the Linux mascot.
2.  Marvel at its beauty.

    ![Tux, the Linux mascot](/assets/images/tux.png)

3.  Close the file.

1. First item
2. Second item
3. Third item
    - Indented item
    - Indented item
4. Fourth item

## Code

At the command prompt, type `nano`.

``Use `code` in your Markdown file.``

  <html>
    <head>
    </head>
  </html>

## Horizontal Rules

Try to put a blank line before...

---

...and after a horizontal rule.

## Links

My favorite search engine is [Duck Duck Go](https://duckduckgo.com).

My favorite search engine is [Duck Duck Go](https://duckduckgo.com "The best search engine for privacy").

<https://www.markdownguide.org>
<fake@example.com>

## Images

![Philadelphia's Magic Gardens. This place was so cool!](/assets/images/philly-magic-gardens.jpg "Philadelphia's Magic Gardens")

## Escaping Characters

\* Without the backslash, this would be a bullet in an unordered list. \\ \` \{ \} \[ \] ...

## HTML

This **word** is bold. This <em>word</em> is italic.
