# Java基础概念详解

## 1. Java简介

Java是一种广泛使用的计算机编程语言，拥有跨平台、面向对象、泛型编程的特性。Java最初由James Gosling和Sun Microsystems开发，于1995年首次发布。

### Java的主要特点：

- **平台无关性**：通过Java虚拟机（JVM）实现"一次编写，到处运行"
- **面向对象**：支持封装、继承、多态等面向对象特性
- **健壮性**：具有自动垃圾回收、异常处理等机制
- **安全性**：提供安全管理机制
- **多线程支持**：内置多线程功能

## 2. Java程序基本结构

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

### 程序结构说明：

- `public class HelloWorld`：定义一个名为HelloWorld的公共类
- `public static void main(String[] args)`：主方法，程序入口点
- `System.out.println()`：输出语句

## 3. Java基本语法

### 3.1 标识符命名规则

- 以字母、下划线(\_)或美元符号($)开头
- 后续字符可以是字母、数字、下划线或美元符号
- 区分大小写
- 不能使用关键字

### 3.2 关键字列表

```
abstract assert boolean break byte case catch char class
const continue default do double else enum extends final
finally float for goto if implements import instanceof
int interface long native new package private protected
public return short static strictfp super switch
synchronized this throw throws transient try void
volatile while
```

## 4. 数据类型

### 4.1 基本数据类型

| 类型   | 关键字  | 大小 | 范围                            | 默认值    |
| ------ | ------- | ---- | ------------------------------- | --------- |
| 字节型 | byte    | 8位  | -128 到 127                     | 0         |
| 短整型 | short   | 16位 | -32,768 到 32,767               | 0         |
| 整型   | int     | 32位 | -2,147,483,648 到 2,147,483,647 | 0         |
| 长整型 | long    | 64位 | -2^63 到 2^63-1                 | 0L        |
| 浮点型 | float   | 32位 | IEEE 754                        | 0.0f      |
| 双精度 | double  | 64位 | IEEE 754                        | 0.0d      |
| 字符型 | char    | 16位 | 0 到 65,535                     | '\\u0000' |
| 布尔型 | boolean | -    | true 或 false                   | false     |

### 4.2 引用数据类型

- 类（Class）
- 接口（Interface）
- 数组（Array）

## 5. 变量类型

### 5.1 局部变量

- 在方法、构造函数或代码块中声明
- 在方法执行结束后销毁

### 5.2 实例变量

- 在类中声明，但在方法外部
- 每个对象都有自己的实例变量副本

### 5.3 类变量（静态变量）

- 用static关键字声明
- 在整个程序运行期间只有一份副本

## 6. 运算符

### 6.1 算术运算符

- `+` 加法
- `-` 减法
- `*` 乘法
- `/` 除法
- `%` 取模
- `++` 自增
- `--` 自减

### 6.2 关系运算符

- `==` 等于
- `!=` 不等于
- `>` 大于
- `<` 小于
- `>=` 大于等于
- `<=` 小于等于

### 6.3 逻辑运算符

- `&&` 逻辑与
- `||` 逻辑或
- `!` 逻辑非

### 6.4 位运算符

- `&` 按位与
- `|` 按位或
- `^` 按位异或
- `~` 按位取反
- `<<` 左移
- `>>` 右移
- `>>>` 无符号右移

### 6.5 赋值运算符

- `=` 简单赋值
- `+=` 加法赋值
- `-=` 减法赋值
- `*=` 乘法赋值
- `/=` 除法赋值
- `%=` 取模赋值
- `&=` 按位与赋值
- `|=` 按位或赋值
- `^=` 按位异或赋值
- `<<=` 左移赋值
- `>>=` 右移赋值
- `>>>=` 无符号右移赋值

## 7. 控制语句

### 7.1 条件语句

#### if语句

```java
if(条件) {
    // 条件为真时执行
} else if(另一个条件) {
    // 另一个条件为真时执行
} else {
    // 所有条件都为假时执行
}
```

#### switch语句

```java
switch(表达式) {
    case 值1:
        // 语句
        break;
    case 值2:
        // 语句
        break;
    default:
        // 默认语句
}
```

### 7.2 循环语句

#### while循环

```java
while(条件) {
    // 循环体
}
```

#### do-while循环

```java
do {
    // 循环体
} while(条件);
```

#### for循环

```java
for(初始化; 条件; 更新) {
    // 循环体
}
```

#### 增强for循环（for-each）

```java
for(类型 变量 : 集合) {
    // 循环体
}
```

### 7.3 跳转语句

- `break`：跳出循环或switch语句
- `continue`：跳过当前迭代，继续下一次迭代
- `return`：从方法返回

## 8. 数组

### 8.1 一维数组

```java
// 声明方式1
int[] arr1 = new int[5];

// 声明方式2
int[] arr2 = {1, 2, 3, 4, 5};

// 声明方式3
int arr3[] = new int[5];
```

### 8.2 多维数组

```java
// 二维数组
int[][] matrix = new int[3][4];
int[][] matrix2 = {{1, 2}, {3, 4}, {5, 6}};
```

## 9. 字符串处理

### 9.1 String类

```java
String str1 = "Hello";
String str2 = new String("World");
```

### 9.2 StringBuilder和StringBuffer

```java
StringBuilder sb = new StringBuilder("Hello");
sb.append(" World");
```

## 10. 异常处理

### 10.1 try-catch-finally

```java
try {
    // 可能抛出异常的代码
} catch(Exception e) {
    // 异常处理代码
} finally {
    // 总是执行的代码
}
```

### 10.2 throws和throw

```java
public void method() throws Exception {
    throw new Exception("自定义异常");
}
```

## 11. 输入输出

### 11.1 标准输入输出

```java
import java.util.Scanner;

Scanner scanner = new Scanner(System.in);
String input = scanner.nextLine();
System.out.println("输出内容");
```

### 11.2 文件操作

```java
import java.io.*;

File file = new File("filename.txt");
FileReader fr = new FileReader(file);
BufferedReader br = new BufferedReader(fr);
```

## 12. Java内存模型

### 12.1 内存区域

- **堆（Heap）**：存储对象实例
- **栈（Stack）**：存储局部变量和方法调用
- **方法区（Method Area）**：存储类信息、常量、静态变量
- **程序计数器（Program Counter Register）**：记录当前线程执行位置
- **本地方法栈（Native Method Stack）**：为本地方法服务

## 13. JVM垃圾回收

### 13.1 垃圾回收算法

- 标记-清除算法
- 复制算法
- 标记-整理算法
- 分代收集算法

### 13.2 垃圾回收器

- Serial GC
- Parallel GC
- CMS GC
- G1 GC
- ZGC

## 14. 编译与运行

### 14.1 编译

```bash
javac HelloWorld.java
```

### 14.2 运行

```bash
java HelloWorld
```

## 15. Java开发工具

### 15.1 IDE

- IntelliJ IDEA
- Eclipse
- NetBeans

### 15.2 构建工具

- Maven
- Gradle
- Ant

## 总结

Java是一门功能强大、应用广泛的编程语言。掌握Java基础概念是学习Java编程的第一步。本章介绍了Java的基本语法、数据类型、控制语句、数组、字符串处理、异常处理等核心概念，为后续深入学习打下坚实基础。
