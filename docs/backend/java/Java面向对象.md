# Java面向对象编程详解

## 1. 面向对象编程概述

面向对象编程（Object-Oriented Programming, OOP）是一种编程范式，它使用"对象"来设计软件。Java是一门纯粹的面向对象编程语言，其核心思想是将现实世界中的事物抽象为程序中的对象。

### 面向对象的三大特性：

- **封装（Encapsulation）**：将数据和操作数据的方法绑定在一起
- **继承（Inheritance）**：子类可以继承父类的属性和方法
- **多态（Polymorphism）**：同一个接口可以有多种不同的实现

## 2. 类和对象

### 2.1 类的定义

```java
public class Student {
    // 成员变量（属性）
    private String name;
    private int age;
    private String studentId;

    // 构造方法
    public Student() {
        // 默认构造方法
    }

    public Student(String name, int age, String studentId) {
        this.name = name;
        this.age = age;
        this.studentId = studentId;
    }

    // 成员方法（行为）
    public void study() {
        System.out.println(name + "正在学习");
    }

    public void attendClass(String className) {
        System.out.println(name + "正在参加" + className + "课程");
    }

    // Getter和Setter方法
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }
}
```

### 2.2 对象的创建和使用

```java
public class Main {
    public static void main(String[] args) {
        // 创建对象
        Student student1 = new Student();
        student1.setName("张三");
        student1.setAge(20);
        student1.setStudentId("2021001");

        Student student2 = new Student("李四", 21, "2021002");

        // 调用对象方法
        student1.study();
        student2.attendClass("Java编程");
    }
}
```

## 3. 封装（Encapsulation）

封装是将对象的属性和实现细节隐藏起来，只通过公共方法来访问。封装提高了代码的安全性和可维护性。

### 3.1 访问修饰符

- `public`：公共访问，任何地方都可以访问
- `protected`：受保护访问，同包和子类可以访问
- `default`（包访问）：同包可以访问
- `private`：私有访问，只有本类内部可以访问

### 3.2 封装示例

```java
public class BankAccount {
    private String accountNumber;    // 私有属性，外部不能直接访问
    private double balance;          // 私有属性
    private String ownerName;

    public BankAccount(String accountNumber, String ownerName, double initialBalance) {
        this.accountNumber = accountNumber;
        this.ownerName = ownerName;
        this.balance = initialBalance;
    }

    // 公共方法访问私有属性
    public double getBalance() {
        return balance;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    // 公共方法修改私有属性（带验证）
    public boolean deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            return true;
        }
        return false;
    }

    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            return true;
        }
        return false;
    }
}
```

## 4. 继承（Inheritance）

继承允许一个类（子类）获得另一个类（父类）的属性和方法。继承体现了"是一个"（is-a）的关系。

### 4.1 继承的基本语法

```java
// 父类
public class Animal {
    protected String name;
    protected int age;

    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void eat() {
        System.out.println(name + "正在吃东西");
    }

    public void sleep() {
        System.out.println(name + "正在睡觉");
    }

    public void makeSound() {
        System.out.println("动物发出声音");
    }
}

// 子类继承父类
public class Dog extends Animal {
    private String breed;

    public Dog(String name, int age, String breed) {
        super(name, age);  // 调用父类构造方法
        this.breed = breed;
    }

    // 重写父类方法
    @Override
    public void makeSound() {
        System.out.println(name + "汪汪叫");
    }

    // 子类特有方法
    public void wagTail() {
        System.out.println(name + "摇尾巴");
    }
}

public class Cat extends Animal {
    private boolean isIndoor;

    public Cat(String name, int age, boolean isIndoor) {
        super(name, age);
        this.isIndoor = isIndoor;
    }

    @Override
    public void makeSound() {
        System.out.println(name + "喵喵叫");
    }

    public void climb() {
        System.out.println(name + "在爬树");
    }
}
```

### 4.2 方法重写（Override）

- 子类可以重写父类的方法来提供特定的实现
- 使用`@Override`注解来标识重写的方法
- 重写方法必须与父类方法具有相同的签名

### 4.3 super关键字

- `super`用于引用父类的成员
- `super()`调用父类构造方法
- `super.methodName()`调用父类方法

## 5. 多态（Polymorphism）

多态是指同一个方法调用可以产生不同的行为，取决于对象的实际类型。

### 5.1 多态的实现方式

```java
public class PolymorphismDemo {
    public static void main(String[] args) {
        // 向上转型：子类对象赋值给父类引用
        Animal animal1 = new Dog("旺财", 3, "金毛");
        Animal animal2 = new Cat("咪咪", 2, true);

        // 多态调用：运行时决定调用哪个方法
        animal1.makeSound();  // 输出：旺财汪汪叫
        animal2.makeSound();  // 输出：咪咪喵喵叫

        // 调用通用方法
        animal1.eat();
        animal2.sleep();
    }
}
```

### 5.2 抽象类和抽象方法

```java
// 抽象类
public abstract class Shape {
    protected String color;

    public Shape(String color) {
        this.color = color;
    }

    // 抽象方法：子类必须实现
    public abstract double calculateArea();
    public abstract double calculatePerimeter();

    // 普通方法
    public void displayInfo() {
        System.out.println("这是一个" + color + "的形状");
    }
}

public class Circle extends Shape {
    private double radius;

    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }

    @Override
    public double calculateArea() {
        return Math.PI * radius * radius;
    }

    @Override
    public double calculatePerimeter() {
        return 2 * Math.PI * radius;
    }
}

public class Rectangle extends Shape {
    private double width;
    private double height;

    public Rectangle(String color, double width, double height) {
        super(color);
        this.width = width;
        this.height = height;
    }

    @Override
    public double calculateArea() {
        return width * height;
    }

    @Override
    public double calculatePerimeter() {
        return 2 * (width + height);
    }
}
```

## 6. 接口（Interface）

接口定义了一组方法规范，类可以实现接口来获得特定的行为能力。

### 6.1 接口的基本语法

```java
// 接口定义
public interface Flyable {
    // 接口中的常量（隐式public static final）
    int MAX_ALTITUDE = 10000;

    // 接口中的方法（隐式public abstract）
    void fly();
    void land();

    // Java 8+ 默认方法
    default void takeOff() {
        System.out.println("正在起飞");
    }

    // Java 8+ 静态方法
    static void checkWeather() {
        System.out.println("检查天气状况");
    }
}

public interface Swimmable {
    void swim();
}
```

### 6.2 实现接口

```java
// 实现单个接口
public class Bird implements Flyable {
    private String name;

    public Bird(String name) {
        this.name = name;
    }

    @Override
    public void fly() {
        System.out.println(name + "正在飞翔");
    }

    @Override
    public void land() {
        System.out.println(name + "正在降落");
    }
}

// 实现多个接口
public class Duck extends Animal implements Flyable, Swimmable {
    public Duck(String name, int age) {
        super(name, age);
    }

    @Override
    public void fly() {
        System.out.println(name + "正在飞");
    }

    @Override
    public void land() {
        System.out.println(name + "正在降落");
    }

    @Override
    public void swim() {
        System.out.println(name + "正在游泳");
    }

    @Override
    public void makeSound() {
        System.out.println(name + "嘎嘎叫");
    }
}
```

## 7. 内部类

内部类是定义在另一个类内部的类，提供了更好的封装性和代码组织。

### 7.1 成员内部类

```java
public class OuterClass {
    private String outerField = "外部类字段";

    // 成员内部类
    public class InnerClass {
        private String innerField = "内部类字段";

        public void accessOuter() {
            // 内部类可以直接访问外部类的成员
            System.out.println("访问外部类字段：" + outerField);
        }

        public void showFields() {
            System.out.println("外部类字段：" + outerField);
            System.out.println("内部类字段：" + innerField);
        }
    }

    public void createInner() {
        InnerClass inner = new InnerClass();
        inner.showFields();
    }
}
```

### 7.2 静态内部类

```java
public class OuterClass {
    private String outerField = "外部类字段";
    private static String staticOuterField = "静态外部字段";

    // 静态内部类
    public static class StaticInnerClass {
        private String innerField = "静态内部类字段";

        public void accessOuter() {
            // 静态内部类只能访问外部类的静态成员
            System.out.println("访问静态外部字段：" + staticOuterField);
            // System.out.println(outerField); // 编译错误
        }
    }
}
```

### 7.3 局部内部类和匿名内部类

```java
public class LocalInnerClassExample {
    private String outerField = "外部字段";

    public void methodWithLocalClass() {
        String localVariable = "局部变量";

        // 局部内部类
        class LocalClass {
            public void accessVariables() {
                System.out.println("外部字段：" + outerField);
                System.out.println("局部变量：" + localVariable);
            }
        }

        LocalClass local = new LocalClass();
        local.accessVariables();
    }

    public void methodWithAnonymousClass() {
        // 匿名内部类
        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                System.out.println("匿名内部类执行");
                System.out.println("可以访问外部字段：" + outerField);
            }
        };

        new Thread(runnable).start();
    }
}
```

## 8. Object类

Object类是所有Java类的根类，所有类都直接或间接继承自Object类。

### 8.1 Object类的重要方法

```java
public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // 重写toString方法
    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age + "}";
    }

    // 重写equals方法
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;

        Person person = (Person) obj;
        return age == person.age &&
               Objects.equals(name, person.name);
    }

    // 重写hashCode方法
    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
}
```

## 9. 设计模式基础

### 9.1 单例模式

```java
// 饿汉式单例
public class Singleton {
    private static final Singleton INSTANCE = new Singleton();

    private Singleton() {
        // 私有构造方法
    }

    public static Singleton getInstance() {
        return INSTANCE;
    }
}

// 懒汉式单例（线程安全）
public class ThreadSafeSingleton {
    private static volatile ThreadSafeSingleton instance;

    private ThreadSafeSingleton() {
    }

    public static ThreadSafeSingleton getInstance() {
        if (instance == null) {
            synchronized (ThreadSafeSingleton.class) {
                if (instance == null) {
                    instance = new ThreadSafeSingleton();
                }
            }
        }
        return instance;
    }
}
```

### 9.2 工厂模式

```java
// 产品接口
interface Shape {
    void draw();
}

// 具体产品
class Circle implements Shape {
    @Override
    public void draw() {
        System.out.println("绘制圆形");
    }
}

class Rectangle implements Shape {
    @Override
    public void draw() {
        System.out.println("绘制矩形");
    }
}

// 工厂类
class ShapeFactory {
    public static Shape createShape(String type) {
        switch (type.toLowerCase()) {
            case "circle":
                return new Circle();
            case "rectangle":
                return new Rectangle();
            default:
                throw new IllegalArgumentException("未知形状类型: " + type);
        }
    }
}
```

## 10. 高级特性

### 10.1 泛型

```java
public class GenericBox<T> {
    private T content;

    public void setContent(T content) {
        this.content = content;
    }

    public T getContent() {
        return content;
    }
}

// 使用泛型
GenericBox<String> stringBox = new GenericBox<>();
stringBox.setContent("Hello");
String content = stringBox.getContent();
```

### 10.2 注解

```java
// 自定义注解
@interface MyAnnotation {
    String value() default "default";
    int count() default 1;
}

// 使用注解
@MyAnnotation(value = "example", count = 5)
public class AnnotatedClass {
    @Override
    public String toString() {
        return "AnnotatedClass{}";
    }
}
```

## 11. 最佳实践

### 11.1 类设计原则

- **单一职责原则**：一个类应该只有一个引起它变化的原因
- **开闭原则**：对扩展开放，对修改关闭
- **里氏替换原则**：子类可以替换父类
- **接口隔离原则**：客户端不应该依赖它不需要的接口
- **依赖倒置原则**：依赖抽象，而不是具体实现

### 11.2 代码示例：遵循设计原则

```java
// 好的设计：遵循单一职责原则
interface PaymentProcessor {
    void processPayment(double amount);
}

class CreditCardProcessor implements PaymentProcessor {
    @Override
    public void processPayment(double amount) {
        System.out.println("使用信用卡支付：" + amount);
    }
}

class PayPalProcessor implements PaymentProcessor {
    @Override
    public void processPayment(double amount) {
        System.out.println("使用PayPal支付：" + amount);
    }
}

// 使用依赖注入
class OrderService {
    private PaymentProcessor paymentProcessor;

    public OrderService(PaymentProcessor paymentProcessor) {
        this.paymentProcessor = paymentProcessor;
    }

    public void completeOrder(double amount) {
        paymentProcessor.processPayment(amount);
    }
}
```

## 总结

面向对象编程是Java的核心特性，通过封装、继承和多态三大特性，Java提供了强大的抽象能力。理解面向对象的概念和实践对于编写高质量的Java程序至关重要。本章介绍了类和对象、访问修饰符、继承、多态、接口、内部类等核心概念，并提供了丰富的代码示例和最佳实践，为深入学习Java编程奠定了坚实基础。
