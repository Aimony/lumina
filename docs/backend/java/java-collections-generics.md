# Java集合框架和泛型详解

## 1. Java集合框架概述

Java集合框架（Java Collections Framework）是一组用于存储和操作数据的接口和类。它提供了各种数据结构的实现，如列表、集合、队列、映射等。

### 1.1 集合框架层次结构

```
Collection
├── List
│   ├── ArrayList
│   ├── LinkedList
│   └── Vector
├── Set
│   ├── HashSet
│   ├── LinkedHashSet
│   └── TreeSet
└── Queue
    ├── LinkedList
    └── PriorityQueue

Map
├── HashMap
├── LinkedHashMap
├── TreeMap
└── Hashtable
```

## 2. Collection接口

Collection是集合框架的根接口，定义了集合的基本操作。

### 2.1 Collection接口常用方法

```java
public interface Collection<E> {
    boolean add(E e);              // 添加元素
    boolean remove(Object o);      // 移除元素
    boolean contains(Object o);    // 检查是否包含元素
    int size();                    // 获取元素个数
    boolean isEmpty();             // 检查是否为空
    Iterator<E> iterator();        // 获取迭代器
    Object[] toArray();            // 转换为数组
    boolean addAll(Collection<? extends E> c);  // 批量添加
    boolean removeAll(Collection<?> c);         // 批量移除
}
```

## 3. List接口及其实现

List是有序集合，允许重复元素，可以通过索引访问元素。

### 3.1 ArrayList

ArrayList基于动态数组实现，支持快速随机访问。

```java
import java.util.*;

public class ArrayListExample {
    public static void main(String[] args) {
        // 创建ArrayList
        List<String> list = new ArrayList<>();

        // 添加元素
        list.add("Apple");
        list.add("Banana");
        list.add("Cherry");
        list.add(1, "Orange");  // 在索引1处插入

        // 访问元素
        System.out.println("第一个元素: " + list.get(0));  // Apple
        System.out.println("列表大小: " + list.size());    // 4

        // 修改元素
        list.set(0, "Grape");

        // 遍历列表
        for (String fruit : list) {
            System.out.println(fruit);
        }

        // 删除元素
        list.remove("Banana");

        // 检查元素是否存在
        System.out.println("是否包含Cherry: " + list.contains("Cherry"));
    }
}
```

### 3.2 LinkedList

LinkedList基于双向链表实现，适合频繁的插入和删除操作。

```java
import java.util.*;

public class LinkedListExample {
    public static void main(String[] args) {
        LinkedList<Integer> linkedList = new LinkedList<>();

        // 添加元素
        linkedList.add(1);
        linkedList.add(2);
        linkedList.add(3);

        // 作为栈使用
        linkedList.push(0);  // 在头部添加
        System.out.println("弹出元素: " + linkedList.pop());  // 0

        // 作为队列使用
        linkedList.offer(4);  // 在尾部添加
        System.out.println("队列头部: " + linkedList.peek());  // 1

        // 访问首尾元素
        System.out.println("第一个元素: " + linkedList.getFirst());
        System.out.println("最后一个元素: " + linkedList.getLast());
    }
}
```

### 3.3 Vector和Stack

Vector是线程安全的动态数组，Stack继承自Vector。

```java
import java.util.*;

public class VectorStackExample {
    public static void main(String[] args) {
        Vector<String> vector = new Vector<>();
        vector.add("A");
        vector.add("B");
        vector.add("C");

        Stack<Integer> stack = new Stack<>();
        stack.push(1);
        stack.push(2);
        stack.push(3);

        System.out.println("栈顶元素: " + stack.peek());  // 3
        System.out.println("弹出元素: " + stack.pop());   // 3
    }
}
```

## 4. Set接口及其实现

Set不允许重复元素，不保证元素的顺序。

### 4.1 HashSet

HashSet基于哈希表实现，提供快速的查找性能。

```java
import java.util.*;

public class HashSetExample {
    public static void main(String[] args) {
        Set<String> hashSet = new HashSet<>();

        // 添加元素
        hashSet.add("Apple");
        hashSet.add("Banana");
        hashSet.add("Cherry");
        hashSet.add("Apple");  // 重复元素，不会被添加

        System.out.println("集合大小: " + hashSet.size());  // 3
        System.out.println("集合内容: " + hashSet);

        // 检查元素是否存在
        System.out.println("是否包含Apple: " + hashSet.contains("Apple"));

        // 遍历集合
        for (String fruit : hashSet) {
            System.out.println(fruit);
        }
    }
}
```

### 4.2 LinkedHashSet

LinkedHashSet维护元素的插入顺序。

```java
import java.util.*;

public class LinkedHashSetExample {
    public static void main(String[] args) {
        Set<String> linkedHashSet = new LinkedHashSet<>();

        linkedHashSet.add("First");
        linkedHashSet.add("Second");
        linkedHashSet.add("Third");
        linkedHashSet.add("First");  // 重复元素

        // 保持插入顺序
        System.out.println(linkedHashSet);  // [First, Second, Third]
    }
}
```

### 4.3 TreeSet

TreeSet基于红黑树实现，元素按自然顺序或自定义比较器排序。

```java
import java.util.*;

public class TreeSetExample {
    public static void main(String[] args) {
        Set<Integer> treeSet = new TreeSet<>();

        treeSet.add(5);
        treeSet.add(2);
        treeSet.add(8);
        treeSet.add(1);
        treeSet.add(9);

        System.out.println("排序后的集合: " + treeSet);  // [1, 2, 5, 8, 9]

        // 获取范围元素
        System.out.println("小于5的元素: " + ((TreeSet<Integer>)treeSet).headSet(5));
        System.out.println("大于等于5的元素: " + ((TreeSet<Integer>)treeSet).tailSet(5));

        // 自定义排序
        Set<String> customSet = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        customSet.add("apple");
        customSet.add("Banana");
        customSet.add("cherry");
        System.out.println("忽略大小写排序: " + customSet);
    }
}
```

## 5. Queue接口及其实现

Queue用于存储和处理元素的队列，通常遵循先进先出（FIFO）原则。

### 5.1 PriorityQueue

PriorityQueue基于堆实现，元素按优先级排序。

```java
import java.util.*;

public class PriorityQueueExample {
    public static void main(String[] args) {
        PriorityQueue<Integer> priorityQueue = new PriorityQueue<>();

        // 添加元素（自动排序）
        priorityQueue.offer(5);
        priorityQueue.offer(2);
        priorityQueue.offer(8);
        priorityQueue.offer(1);

        System.out.println("队列内容: " + priorityQueue);

        // 按优先级取出元素
        while (!priorityQueue.isEmpty()) {
            System.out.println("取出: " + priorityQueue.poll());
        }

        // 自定义优先级
        PriorityQueue<String> stringQueue = new PriorityQueue<>(
            (s1, s2) -> s2.length() - s1.length()  // 按长度降序
        );
        stringQueue.offer("short");
        stringQueue.offer("very long string");
        stringQueue.offer("medium");

        while (!stringQueue.isEmpty()) {
            System.out.println(stringQueue.poll());
        }
    }
}
```

### 5.2 Deque（双端队列）

```java
import java.util.*;

public class DequeExample {
    public static void main(String[] args) {
        Deque<String> deque = new LinkedList<>();

        // 从头部添加
        deque.offerFirst("First");
        deque.offerFirst("Second");

        // 从尾部添加
        deque.offerLast("Last");

        System.out.println("双端队列: " + deque);  // [Second, First, Last]

        // 从头部取出
        System.out.println("从头部取出: " + deque.pollFirst());

        // 从尾部取出
        System.out.println("从尾部取出: " + deque.pollLast());
    }
}
```

## 6. Map接口及其实现

Map存储键值对，键不允许重复。

### 6.1 HashMap

HashMap基于哈希表实现，提供快速的键值查找。

```java
import java.util.*;

public class HashMapExample {
    public static void main(String[] args) {
        Map<String, Integer> hashMap = new HashMap<>();

        // 添加键值对
        hashMap.put("Apple", 10);
        hashMap.put("Banana", 20);
        hashMap.put("Cherry", 15);
        hashMap.put("Apple", 12);  // 更新已存在的键

        // 获取值
        System.out.println("Apple的数量: " + hashMap.get("Apple"));  // 12

        // 检查键是否存在
        System.out.println("是否包含Banana键: " + hashMap.containsKey("Banana"));

        // 检查值是否存在
        System.out.println("是否包含值15: " + hashMap.containsValue(15));

        // 遍历Map
        for (Map.Entry<String, Integer> entry : hashMap.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }

        // 使用Lambda表达式遍历
        hashMap.forEach((key, value) ->
            System.out.println(key + " -> " + value)
        );

        // 移除键值对
        hashMap.remove("Cherry");
    }
}
```

### 6.2 LinkedHashMap

LinkedHashMap维护元素的插入顺序。

```java
import java.util.*;

public class LinkedHashMapExample {
    public static void main(String[] args) {
        Map<String, Integer> linkedHashMap = new LinkedHashMap<>();

        linkedHashMap.put("First", 1);
        linkedHashMap.put("Second", 2);
        linkedHashMap.put("Third", 3);

        // 保持插入顺序
        System.out.println("LinkedHashMap: " + linkedHashMap);
    }
}
```

### 6.3 TreeMap

TreeMap基于红黑树实现，键按自然顺序或自定义比较器排序。

```java
import java.util.*;

public class TreeMapExample {
    public static void main(String[] args) {
        Map<String, Integer> treeMap = new TreeMap<>();

        treeMap.put("banana", 20);
        treeMap.put("apple", 10);
        treeMap.put("cherry", 15);
        treeMap.put("date", 25);

        System.out.println("排序后的Map: " + treeMap);

        // 获取范围键值对
        Map<String, Integer> subMap = ((TreeMap<String, Integer>)treeMap)
            .subMap("apple", "cherry");
        System.out.println("范围子Map: " + subMap);

        // 获取键的范围
        SortedMap<String, Integer> headMap = ((TreeMap<String, Integer>)treeMap)
            .headMap("cherry");
        System.out.println("头部子Map: " + headMap);
    }
}
```

### 6.4 Hashtable

Hashtable是线程安全的Map实现，不允许null键和null值。

```java
import java.util.*;

public class HashtableExample {
    public static void main(String[] args) {
        Hashtable<String, Integer> hashtable = new Hashtable<>();

        hashtable.put("A", 1);
        hashtable.put("B", 2);
        hashtable.put("C", 3);

        // Hashtable是线程安全的
        System.out.println("Hashtable: " + hashtable);
    }
}
```

## 7. 泛型（Generics）

泛型允许在定义类、接口和方法时使用类型参数，提供编译时类型安全检查。

### 7.1 泛型类

```java
public class GenericBox<T> {
    private T content;

    public void setContent(T content) {
        this.content = content;
    }

    public T getContent() {
        return content;
    }

    public boolean isEmpty() {
        return content == null;
    }
}

// 使用泛型类
GenericBox<String> stringBox = new GenericBox<>();
stringBox.setContent("Hello");
String content = stringBox.getContent();

GenericBox<Integer> intBox = new GenericBox<>();
intBox.setContent(42);
Integer number = intBox.getContent();
```

### 7.2 泛型方法

```java
public class GenericMethods {
    // 泛型方法
    public static <T> void swap(T[] array, int i, int j) {
        T temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    // 有界类型参数
    public static <T extends Number> double sum(T[] numbers) {
        double sum = 0.0;
        for (T num : numbers) {
            sum += num.doubleValue();
        }
        return sum;
    }

    // 多个类型参数
    public static <K, V> void printPair(K key, V value) {
        System.out.println(key + " = " + value);
    }
}

// 使用示例
String[] strings = {"A", "B", "C"};
GenericMethods.swap(strings, 0, 2);

Integer[] integers = {1, 2, 3, 4, 5};
double sum = GenericMethods.sum(integers);
System.out.println("Sum: " + sum);

GenericMethods.printPair("name", "John");
GenericMethods.printPair(1, "one");
```

### 7.3 通配符

```java
import java.util.*;

public class WildcardExample {
    // 上界通配符
    public static double sumOfList(List<? extends Number> list) {
        double sum = 0.0;
        for (Number num : list) {
            sum += num.doubleValue();
        }
        return sum;
    }

    // 下界通配符
    public static void addNumbers(List<? super Integer> list) {
        for (int i = 1; i <= 5; i++) {
            list.add(i);
        }
    }

    // 无界通配符
    public static void printList(List<?> list) {
        for (Object obj : list) {
            System.out.println(obj);
        }
    }

    public static void main(String[] args) {
        List<Integer> intList = Arrays.asList(1, 2, 3);
        System.out.println("Sum: " + sumOfList(intList));

        List<Number> numberList = new ArrayList<>();
        addNumbers(numberList);
        System.out.println("Numbers: " + numberList);

        List<String> stringList = Arrays.asList("A", "B", "C");
        printList(stringList);
    }
}
```

## 8. 集合工具类

### 8.1 Collections工具类

```java
import java.util.*;

public class CollectionsExample {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.addAll(Arrays.asList("Apple", "Banana", "Cherry", "Date"));

        // 排序
        Collections.sort(list);
        System.out.println("排序后: " + list);

        // 混排
        Collections.shuffle(list);
        System.out.println("混排后: " + list);

        // 反转
        Collections.reverse(list);
        System.out.println("反转后: " + list);

        // 查找
        int index = Collections.binarySearch(list, "Cherry");
        System.out.println("Cherry的索引: " + index);

        // 频次统计
        List<String> repeated = Arrays.asList("A", "B", "A", "C", "A");
        int freq = Collections.frequency(repeated, "A");
        System.out.println("A出现次数: " + freq);

        // 线程安全包装
        List<String> syncList = Collections.synchronizedList(new ArrayList<>());

        // 不可变集合
        List<String> immutableList = Collections.unmodifiableList(list);
    }
}
```

### 8.2 Arrays工具类

```java
import java.util.*;

public class ArraysExample {
    public static void main(String[] args) {
        int[] array = {3, 1, 4, 1, 5, 9, 2, 6};

        // 排序
        Arrays.sort(array);
        System.out.println("排序后: " + Arrays.toString(array));

        // 二分查找
        int index = Arrays.binarySearch(array, 5);
        System.out.println("5的索引: " + index);

        // 填充
        Arrays.fill(array, 0);
        System.out.println("填充后: " + Arrays.toString(array));

        // 复制
        int[] copy = Arrays.copyOf(array, array.length);
        System.out.println("复制数组: " + Arrays.toString(copy));

        // 比较
        boolean isEqual = Arrays.equals(array, copy);
        System.out.println("数组相等: " + isEqual);

        // 转换为List
        String[] strArray = {"A", "B", "C"};
        List<String> list = Arrays.asList(strArray);
        System.out.println("转换为List: " + list);
    }
}
```

## 9. 集合性能比较

### 9.1 时间复杂度比较

| 操作     | ArrayList | LinkedList | HashSet | HashMap |
| -------- | --------- | ---------- | ------- | ------- |
| 随机访问 | O(1)      | O(n)       | 不支持  | 不支持  |
| 插入头部 | O(n)      | O(1)       | O(1)    | O(1)    |
| 插入尾部 | O(1)      | O(1)       | O(1)    | O(1)    |
| 查找     | O(n)      | O(n)       | O(1)    | O(1)    |
| 删除     | O(n)      | O(1)       | O(1)    | O(1)    |

### 9.2 使用场景选择

- **ArrayList**: 需要频繁随机访问，较少插入/删除中间元素
- **LinkedList**: 频繁在头部/尾部插入/删除元素
- **HashSet**: 需要快速查找、不关心元素顺序
- **TreeSet**: 需要排序的集合
- **HashMap**: 需要键值对映射、快速查找
- **TreeMap**: 需要按键排序的映射

## 10. 迭代器（Iterator）

迭代器提供统一的遍历集合的方式。

```java
import java.util.*;

public class IteratorExample {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("A", "B", "C", "D");

        // 使用Iterator遍历
        Iterator<String> iterator = list.iterator();
        while (iterator.hasNext()) {
            String element = iterator.next();
            System.out.println(element);

            // 在遍历过程中删除元素
            if (element.equals("B")) {
                iterator.remove();
            }
        }

        // 使用ListIterator（支持双向遍历）
        List<String> list2 = new ArrayList<>();
        list2.addAll(Arrays.asList("X", "Y", "Z"));

        ListIterator<String> listIterator = list2.listIterator();
        System.out.println("正向遍历:");
        while (listIterator.hasNext()) {
            System.out.println(listIterator.nextIndex() + ": " +
                             listIterator.next());
        }

        System.out.println("反向遍历:");
        while (listIterator.hasPrevious()) {
            System.out.println(listIterator.previousIndex() + ": " +
                             listIterator.previous());
        }
    }
}
```

## 11. 并发集合

Java提供了专门用于并发环境的集合类。

```java
import java.util.concurrent.*;
import java.util.*;

public class ConcurrentCollectionsExample {
    public static void main(String[] args) throws InterruptedException {
        // ConcurrentHashMap - 线程安全的HashMap
        ConcurrentHashMap<String, Integer> concurrentMap = new ConcurrentHashMap<>();
        concurrentMap.put("A", 1);
        concurrentMap.put("B", 2);

        // CopyOnWriteArrayList - 读多写少场景
        CopyOnWriteArrayList<String> cowList = new CopyOnWriteArrayList<>();
        cowList.add("Item1");
        cowList.add("Item2");

        // BlockingQueue - 线程间通信
        BlockingQueue<String> queue = new LinkedBlockingQueue<>(10);

        // 生产者线程
        Thread producer = new Thread(() -> {
            try {
                for (int i = 0; i < 5; i++) {
                    queue.put("Item" + i);
                    System.out.println("生产: Item" + i);
                    Thread.sleep(1000);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        // 消费者线程
        Thread consumer = new Thread(() -> {
            try {
                for (int i = 0; i < 5; i++) {
                    String item = queue.take();
                    System.out.println("消费: " + item);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        producer.start();
        consumer.start();

        producer.join();
        consumer.join();
    }
}
```

## 12. 集合最佳实践

### 12.1 选择合适的集合类型

```java
public class CollectionBestPractices {
    // 根据使用场景选择集合
    public void chooseCollection() {
        // 需要索引访问 - 使用List
        List<String> indexedAccess = new ArrayList<>();

        // 不允许重复 - 使用Set
        Set<String> uniqueItems = new HashSet<>();

        // 键值对映射 - 使用Map
        Map<String, Object> keyValuePairs = new HashMap<>();

        // 需要排序 - 使用TreeSet/TreeMap
        SortedSet<Integer> sortedNumbers = new TreeSet<>();
        SortedMap<String, Integer> sortedMap = new TreeMap<>();
    }

    // 预设初始容量
    public void setInitialCapacity() {
        // 避免频繁扩容
        List<String> list = new ArrayList<>(1000);
        Map<String, Integer> map = new HashMap<>(500);
    }

    // 使用泛型
    public void useGenerics() {
        // 好的做法
        List<String> stringList = new ArrayList<>();

        // 避免原始类型
        // List rawList = new ArrayList(); // 不推荐
    }
}
```

### 12.2 集合操作优化

```java
import java.util.stream.Collectors;

public class CollectionOptimization {
    public void optimizationExamples() {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        // 使用Stream API进行复杂操作
        List<Integer> evenSquares = numbers.stream()
            .filter(n -> n % 2 == 0)
            .map(n -> n * n)
            .collect(Collectors.toList());

        // 批量操作
        Set<String> set1 = new HashSet<>(Arrays.asList("A", "B", "C"));
        Set<String> set2 = new HashSet<>(Arrays.asList("B", "C", "D"));

        // 求交集
        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        // 求并集
        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);

        // 求差集
        Set<String> difference = new HashSet<>(set1);
        difference.removeAll(set2);
    }
}
```

## 13. 常见错误和注意事项

### 13.1 常见错误

```java
public class CommonMistakes {
    public void avoidMistakes() {
        List<String> list = new ArrayList<>();
        list.add("A");
        list.add("B");
        list.add("C");

        // 错误：在迭代时修改集合
        // for (String item : list) {
        //     if ("B".equals(item)) {
        //         list.remove(item);  // 会抛出ConcurrentModificationException
        //     }
        // }

        // 正确：使用Iterator
        Iterator<String> iter = list.iterator();
        while (iter.hasNext()) {
            String item = iter.next();
            if ("B".equals(item)) {
                iter.remove();  // 安全的删除方式
            }
        }

        // 错误：使用非静态内部类作为Map的键
        // Map<OuterClass.InnerClass, String> map = new HashMap<>();
        // 应该确保键类正确实现equals和hashCode方法
    }
}
```

### 13.2 性能注意事项

```java
public class PerformanceTips {
    public void performanceConsiderations() {
        // 预估容量避免频繁扩容
        List<String> largeList = new ArrayList<>(10000);

        // 使用合适的数据结构
        // 频繁查找 - HashSet
        Set<String> fastLookup = new HashSet<>();

        // 频繁插入删除 - LinkedList
        List<String> frequentChanges = new LinkedList<>();

        // 需要排序 - TreeSet/TreeMap
        SortedSet<String> sortedSet = new TreeSet<>();

        // 线程安全 - 使用并发集合
        Map<String, Object> concurrentMap = new ConcurrentHashMap<>();
    }
}
```

## 总结

Java集合框架提供了丰富而强大的数据结构实现，从基础的List、Set、Map到高级的并发集合，满足各种编程需求。泛型机制增强了类型安全性，避免了运行时类型转换错误。

选择合适的集合类型对于程序性能至关重要：

- ArrayList适用于随机访问多、插入删除少的场景
- LinkedList适用于频繁插入删除的场景
- HashSet适用于快速查找去重的场景
- HashMap适用于键值对映射的场景

掌握集合框架的使用方法和最佳实践，是Java编程的重要基础。
