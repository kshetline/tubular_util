## Java

```java
/* Block comment */
import java.util.Date;
import static AnInterface.CONSTANT;
import static java.util.Date.parse;
import static SomeClass.staticField;
/**
 * Doc comment here for <code>SomeClass</code>
 * @param T type parameter
 * @see Math#sin(double)
 */
@Annotation (name=value)
public class SomeClass<T extends Runnable> { // some comment
  private T field = null;
  private double unusedField = 12345.67890;
  private UnknownType anotherString = "Another\nStrin\g";
  public static int staticField = 0;
  public final int instanceFinalField = 0;
  protected final int protectedField = 0;
  final int packagePrivateField = 0;

  /**
   * Semantic highlighting:
   * Generated spectrum to pick colors for local variables and parameters:
   *  Color#1 SC1.1 SC1.2 SC1.3 SC1.4 Color#2 SC2.1 SC2.2 SC2.3 SC2.4 Color#3
   *  Color#3 SC3.1 SC3.2 SC3.3 SC3.4 Color#4 SC4.1 SC4.2 SC4.3 SC4.4 Color#5
   * @param param1
   * @param param2
   * @param param3
   */
  public SomeClass(AnInterface param1,
                  int param2,
                  int param3) {
    int reassignedValue = this.staticField + param2 + param3;
    long localVar1, localVar2, localVar3, localVar4;
    int localVar = "IntelliJ"; // Error, incompatible types
    System.out.println(anotherString + toString() + localVar);
    int sum = protectedField + packagePrivateField + staticField;
    long time = parse("1.2.3"); // Method is deprecated
    new Thread().countStackFrames(); // Method is deprecated and marked for removal
    reassignedValue ++; 
    field.run(); 
    new SomeClass() {
      {
        int a = localVar;
      }
    };
    int[] l = new ArrayList<String>().toArray(new int[CONSTANT]);
  }
}
enum AnEnum { CONST1, CONST2 }
interface AnInterface {
  int CONSTANT = 2;
  void method();
}
abstract class SomeAbstractClass {
  protected int instanceField = staticField;
}
```

## HTML

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2//EN">
<!--
*        Sample comment
-->
<HTML>
<head>
<title>IntelliJ IDEA</title>
</head>
<body>
<h1>IntelliJ IDEA</h1>
<p><br><b><IMG border=0 height=12 src="images/hg.gif" width=18 >
What is IntelliJ&nbsp;IDEA? &#x00B7; &Alpha; </b><br><br>
<custom-tag>hello</custom_tag>
</body>
</html>
```

## JavaScript

```javascript
@defineElement("download-button")
class DownloadButton extends HTMLButtonElement {
  static STATIC_FIELD = `<span title="HTML injection">${globalVariable}</span>`;

  static get observedAttributes() {
    return [ 'data-test' ];
  }

  #field = { prop: 1 };

  method() {
    this.click();

    label:
      while (true) {
        break label;
      }
  }
}

export const EXPORTED_VARIABLE = 1;
export function exportedFunction() {}
export class ExportedClass {}

const globalVariable = "chars\n\u11";

function JsxComponent() {
  return <JsxClientComponent />;
}
```

## TypeScript

```typescript
interface ValidatorOptions {
    minLength?: number,
}

type ValidatorDescriptor = {
    options: ValidatorOptions,
};

const transform = (param: string | number) =>
    typeof param === "string" ? param : param.toString();

function globalFunction<T>({ options = {} }: ValidatorDescriptor) {
    const { minLength } = options;

    /**
     * @description Validator
     * @param {string?} value - parameter description
     */
    const localFunction = (value: string) => {
        let isValid = value?.length >= minLength ?? 3; // line comment
        /* Block comment */
        isValid = isValid && (/^\d.[A-F]+$/i).test(value);
        return {
            isValid,
        };
    };
}

@defineElement("download-button")
class DownloadButton<T extends ButtonProps> extends HTMLButtonElement {
    static STATIC_FIELD = `<span title="HTML injection">${globalVariable}</span>`;

    static get observedAttributes(): string[] {
        return ['data-test'];
    }

    #field = { prop: 1 };

    public method(props: T) {
        this.click();

        label:
            while (true) {
                break label;
            }
    }
}

enum EnumName {
    EnumMember,
}

module Test {
    declare function run(): void;
}

export const EXPORTED_VARIABLE = 1;
export function exportedFunction() {}
export class ExportedClass {}

const globalVariable = "chars\n\u11";
const templateLiteral: `Template ${string | number} type` = `Template ${globalVariable} type`;

#
```

## JSON

```json
{
  // Line comments are not included in standard but nonetheless allowed.
  /* As well as block comments. */
  "the only keywords are": [true, false, null],
  "strings with": {
    "no escapes": "pseudopolinomiality"
    "valid escapes": "C-style\r\n and unicode\u0021",
    "illegal escapes": "\0377\x\"
  },
  "some numbers": [
    42,
    -0.0e-0,
    6.626e-34
  ] 
}
```

## Kotlin

```kotlin
/* Block comment */
package hello
import kotlin.collections.* // line comment

/**
 * Doc comment here for `SomeClass`
 * @see Iterator#next()
 */
@Deprecated(message = "Deprecated class")
private class MyClass<out T : Iterable<T>>(var prop1 : Int) {
    fun foo(nullable : String?, r : Runnable, f : () -> Int, fl : FunctionLike, dyn: dynamic) {
        println("length\nis ${nullable?.length} \e")
        println(nullable!!.length)
        val ints = java.util.ArrayList<Int?>(2)
        ints[0] = 102 + f() + fl()
        val myFun = { -> "" };
        var ref = ints.size
        ints.lastIndex + globalCounter
        ints.forEach lit@ {
            if (it == null) return@lit
            println(it + ref)
        }
        dyn.dynamicCall()
        dyn.dynamicProp = 5
        val klass = MyClass::class
        val year = java.time.LocalDate.now().year
    }

    override fun hashCode(): Int {
        return super.hashCode() * 31
    }
}

fun Int?.bar() {
    if (this != null) {
        println(message = toString())
    }
    else {
        println(this.toString())
    }
}

var globalCounter : Int = 5
    get() = field

abstract class Abstract {
    val bar get() = 1
    fun test() {
        bar
    }
}

object Obj

enum class E { A, B }

interface FunctionLike {
    operator fun invoke() = 1
}

typealias Predicate<T> = (T) -> Boolean
fun baz(p: Predicate<Int>) = p(42)

suspend fun suspendCall() = 
  suspendFn()

suspend fun suspendFn() {}
```

## SQL

```sql
-- DDL section
create table crm.product (
  id numeric primary key,
  title varchar(255) character set utf8
);
-- DML section
insert into product
  values (1, 'Product1');

select count(*) from crm.product;
select id as ProductID, title as ProductName
  from crm.product where id = :id;

\set content `cat data.txt`
```

## XML

```xml
<?xml version='1.0' encoding='ISO-8859-1'  ?>
<!DOCTYPE index>
<!-- Some xml example -->
<index version="1.0" xmlns:pf="http://test">
   <name>Main Index</name>
   <indexitem text="rename" target="refactoring.rename"/>
   <indexitem text="move" target="refactoring.move"/>
   <indexitem text="migrate" target="refactoring.migrate"/>
   <indexitem text="usage search" target="find.findUsages"/>
   <indexitem>Matched tag name</indexitem>
   <someTextWithEntityRefs>&amp; &#x00B7;</someTextWithEntityRefs>
   <withCData><![CDATA[
          <object class="MyClass" key="constant">
          </object>
        ]]>
   </withCData>
   <indexitem text="project" target="project.management"/>
   <custom-tag>hello</custom-tag>
   <pf:foo pf:bar="bar"/>
</index>
```

## PHP

```php
<?php
$heredoc = <<< HEREDOC_ID
some $contents
HEREDOC_ID;

function foo() {
   $a = [0, 1, 2];
   return SomeClass::$shared;
}

// Sample comment

use AnotherClass as SomeAlias;
#[Attribute] class SomeClass extends One implements Another {
   #[Attribute(1, 2)] public $my;
   protected $myProtected;
   private $myPrivate;
   public static $shared;
   const CONSTANT = 0987654321;
   /**
    * Description by <a href="mailto:">user@host.dom</a>
    * Semantic highlighting:
    * Generated spectrum to pick colors for local variables and parameters:
    *  Color#1 SC1.1 SC1.2 SC1.3 SC1.4 Color#2 SC2.1 SC2.2 SC2.3 SC2.4 Color#3
    *  Color#3 SC3.1 SC3.2 SC3.3 SC3.4 Color#4 SC4.1 SC4.2 SC4.3 SC4.4 Color#5
    * @template TValue
    * @param $abc
    * @param TValue $def
    * @property $magic
    * @method m()
    * @return SomeType
    */
   function doSmth($abc, $def, int $foo, SomeClass $bar) {
      /** @var SomeAlias $b */
      $b = new SomeAlias();
      foo();
      $def .=  self::magic;
      $def .=  self::CONSTANT;
      $v = Helper::convert(namedArgument: $abc . "\n {$def}" . $$def);
      $q = new Query( $this->invent(abs(0x80)) );
      $q = new Query( $this->protectedInvent(abs(0x80)) );
      $q = new Query( $this->privateInvent(abs(0x80)) );
      $q = $this->createQueryBuilder()
          ->where("p.id <= :id")
          ->setParameter("id", 1);
      return array($v => $q->result);
   }
}

interface Another {
}

include (dirname(__FILE__) . "inc.php");
`rm -r`;

goto Label;

<p><?php echo "Hello, world!"?></p>

Label:
№
```
