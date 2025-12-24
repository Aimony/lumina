# Java新特性及性能优化指南

## 1. Java版本演进与新特性

### 1.1 Java 8新特性

Java 8是Java历史上最重要的版本之一，引入了大量现代化特性。

#### 1.1.1 Lambda表达式

Lambda表达式提供了一种简洁的方式来表示匿名函数。

```java
// 传统匿名内部类
Runnable runnable1 = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello from anonymous class");
    }
};

// Lambda表达式
Runnable runnable2 = () -> System.out.println("Hello from lambda");

// 带参数的Lambda
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.forEach(name -> System.out.println(name));

// 方法引用
names.forEach(System.out::println);  // 等价于 name -> System.out.println(name)
```

#### 1.1.2 Stream API

Stream API提供了函数式编程的集合操作。

```java
import java.util.*;
import java.util.stream.*;

public class StreamExample {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        // 过滤偶数并求平方
        List<Integer> evenSquares = numbers.stream()
            .filter(n -> n % 2 == 0)           // 过滤
            .map(n -> n * n)                   // 转换
            .collect(Collectors.toList());     // 收集结果

        System.out.println("偶数的平方: " + evenSquares);

        // 求和
        int sum = numbers.stream()
            .mapToInt(Integer::intValue)
            .sum();

        // 查找最大值
        Optional<Integer> max = numbers.stream()
            .max(Integer::compareTo);

        // 分组
        Map<Integer, List<Integer>> grouped = numbers.stream()
            .collect(Collectors.groupingBy(n -> n % 3));

        System.out.println("按模3分组: " + grouped);
    }
}
```

#### 1.1.3 Optional类

Optional类用于避免空指针异常。

```java
import java.util.Optional;

public class OptionalExample {
    public static void main(String[] args) {
        Optional<String> optional1 = Optional.of("Hello");
        Optional<String> optional2 = Optional.empty();
        Optional<String> optional3 = Optional.ofNullable(null);

        // 安全获取值
        String value = optional1.orElse("Default");
        System.out.println("值: " + value);

        // 条件操作
        optional1.ifPresent(s -> System.out.println("存在值: " + s));

        // 链式操作
        Optional<String> result = Optional.of("Hello")
            .filter(s -> s.length() > 3)
            .map(String::toUpperCase);

        System.out.println("处理结果: " + result.orElse("无结果"));
    }
}
```

#### 1.1.4 新的日期时间API

```java
import java.time.*;
import java.time.format.DateTimeFormatter;

public class DateTimeExample {
    public static void main(String[] args) {
        // 当前日期时间
        LocalDateTime now = LocalDateTime.now();
        System.out.println("当前时间: " + now);

        // 特定日期时间
        LocalDateTime specific = LocalDateTime.of(2023, 12, 25, 10, 30, 0);
        System.out.println("特定时间: " + specific);

        // 日期计算
        LocalDateTime future = now.plusDays(30).plusHours(5);
        System.out.println("30天5小时后: " + future);

        // 格式化
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formatted = now.format(formatter);
        System.out.println("格式化时间: " + formatted);

        // 时区处理
        ZonedDateTime zoned = ZonedDateTime.now(ZoneId.of("Asia/Shanghai"));
        System.out.println("上海时间: " + zoned);
    }
}
```

### 1.2 Java 9-17新特性

#### 1.2.1 模块系统（Java 9）

```java
// module-info.java
module com.example.mymodule {
    requires java.base;
    requires java.logging;

    exports com.example.api;
    opens com.example.internal;
}
```

#### 1.2.2 多行字符串（Java 13+）

```java
public class TextBlocksExample {
    public static void main(String[] args) {
        String html = """
            <html>
                <body>
                    <p>Hello, World!</p>
                </body>
            </html>
            """;

        System.out.println(html);
    }
}
```

#### 1.2.3 Switch表达式（Java 14+）

```java
public class SwitchExpressionExample {
    public static void main(String[] args) {
        String day = "MONDAY";

        // 传统switch
        int traditional = switch (day) {
            case "MONDAY", "FRIDAY", "SUNDAY" -> 6;
            case "TUESDAY" -> 7;
            case "THURSDAY", "SATURDAY" -> 8;
            case "WEDNESDAY" -> 9;
            default -> 0;
        };

        System.out.println("结果: " + traditional);
    }
}
```

#### 1.2.4 记录类（Java 14+）

```java
// 记录类自动生成构造器、getter、toString、equals、hashCode
public record PersonRecord(String name, int age, String email) {
    // 可以添加自定义构造器
    public PersonRecord {
        if (age < 0) {
            throw new IllegalArgumentException("年龄不能为负数");
        }
    }

    // 可以添加自定义方法
    public boolean isAdult() {
        return age >= 18;
    }
}

// 使用示例
PersonRecord person = new PersonRecord("张三", 25, "zhang@example.com");
System.out.println(person.name());  // 访问属性
System.out.println(person.isAdult());  // 调用自定义方法
```

#### 1.2.5 密封类（Java 17）

```java
// 密封类限制继承
public sealed class Shape permits Circle, Rectangle, Triangle {
    public abstract double area();
}

final class Circle extends Shape {
    private double radius;

    public Circle(double radius) {
        this.radius = radius;
    }

    @Override
    public double area() {
        return Math.PI * radius * radius;
    }
}

final class Rectangle extends Shape {
    private double width, height;

    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public double area() {
        return width * height;
    }
}
```

#### 1.2.6 模式匹配（Java 16+）

```java
public class PatternMatchingExample {
    public static void main(String[] args) {
        Object obj = "Hello World";

        // 传统方式
        if (obj instanceof String) {
            String str = (String) obj;
            System.out.println("长度: " + str.length());
        }

        // 模式匹配（Java 16+）
        if (obj instanceof String str) {
            System.out.println("长度: " + str.length());
        }

        // switch中的模式匹配
        switch (obj) {
            case String s -> System.out.println("字符串: " + s);
            case Integer i -> System.out.println("整数: " + i);
            case null -> System.out.println("空值");
            default -> System.out.println("其他类型");
        }
    }
}
```

## 2. 性能优化基础

### 2.1 JVM内存模型

JVM内存分为以下几个区域：

- **堆（Heap）**：存储对象实例，垃圾回收的主要区域
- **方法区（Metaspace）**：存储类信息、常量、静态变量等
- **栈（Stack）**：存储局部变量和方法调用
- **程序计数器**：记录当前线程执行位置
- **本地方法栈**：为本地方法服务

### 2.2 JVM参数调优

```bash
# 堆内存设置
-Xms2g        # 初始堆大小
-Xmx4g        # 最大堆大小

# 新生代设置
-Xmn1g        # 新生代大小
-XX:NewRatio=2 # 新老年代比例

# 垃圾回收器设置
-XX:+UseG1GC  # 使用G1垃圾回收器
-XX:MaxGCPauseMillis=200 # 最大GC暂停时间

# 元空间设置
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=512m
```

### 2.3 性能监控工具

#### 2.3.1 jstat - 监控JVM统计信息

```bash
# 监控垃圾回收统计
jstat -gc <pid>

# 监控堆内存使用
jstat -gccapacity <pid>

# 监控类加载统计
jstat -class <pid>
```

#### 2.3.2 jstack - 获取线程堆栈

```bash
# 获取线程堆栈信息
jstack <pid>

# 检测死锁
jstack -l <pid>
```

#### 2.3.3 jmap - 内存映像工具

```bash
# 生成堆转储文件
jmap -dump:format=b,file=heap.hprof <pid>

# 查看内存使用情况
jmap -heap <pid>
```

## 3. 代码层面的性能优化

### 3.1 字符串优化

#### 3.1.1 String、StringBuilder、StringBuffer的选择

```java
public class StringOptimization {
    // 错误：在循环中使用String拼接
    public String badConcatenation(List<String> strings) {
        String result = "";
        for (String s : strings) {
            result += s;  // 每次都创建新的String对象
        }
        return result;
    }

    // 正确：使用StringBuilder
    public String goodConcatenation(List<String> strings) {
        StringBuilder sb = new StringBuilder();
        for (String s : strings) {
            sb.append(s);
        }
        return sb.toString();
    }

    // 预设容量避免频繁扩容
    public String optimizedConcatenation(List<String> strings) {
        int totalLength = strings.stream()
            .mapToInt(String::length)
            .sum();

        StringBuilder sb = new StringBuilder(totalLength);
        for (String s : strings) {
            sb.append(s);
        }
        return sb.toString();
    }
}
```

#### 3.1.2 字符串常量池的使用

```java
public class StringPoolExample {
    public static void main(String[] args) {
        String s1 = "Hello";           // 字符串常量池
        String s2 = "Hello";           // 从常量池获取
        String s3 = new String("Hello"); // 堆中创建新对象
        String s4 = s3.intern();       // 将s3放入常量池

        System.out.println(s1 == s2);  // true
        System.out.println(s1 == s3);  // false
        System.out.println(s1 == s4);  // true
    }
}
```

### 3.2 集合优化

#### 3.2.1 预设集合容量

```java
public class CollectionOptimization {
    // 避免频繁扩容
    public void optimizedListCreation() {
        // 预估容量
        List<String> list = new ArrayList<>(10000);

        // 预估Map容量以避免扩容
        Map<String, Integer> map = new HashMap<>(1000, 0.75f);
    }

    // 选择合适的集合类型
    public void chooseRightCollection() {
        // 随机访问多 - ArrayList
        List<Integer> randomAccessList = new ArrayList<>();

        // 频繁插入删除 - LinkedList
        List<Integer> frequentChangeList = new LinkedList<>();

        // 快速查找 - HashSet
        Set<String> fastLookupSet = new HashSet<>();

        // 需要排序 - TreeSet
        Set<Integer> sortedSet = new TreeSet<>();
    }
}
```

#### 3.2.2 Stream API优化

```java
public class StreamOptimization {
    public void optimizeStreamOperations() {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        // 避免不必要的中间操作
        List<Integer> result = numbers.stream()
            .filter(n -> n % 2 == 0)     // 先过滤，减少后续操作的数据量
            .map(n -> n * n)             // 再映射
            .limit(5)                    // 限制结果数量
            .collect(Collectors.toList());

        // 使用并行流处理大量数据
        List<Integer> largeList = new ArrayList<>();
        for (int i = 0; i < 1000000; i++) {
            largeList.add(i);
        }

        long startTime = System.currentTimeMillis();
        long sum1 = largeList.stream()
            .mapToLong(Long::valueOf)
            .sum();
        long sequentialTime = System.currentTimeMillis() - startTime;

        startTime = System.currentTimeMillis();
        long sum2 = largeList.parallelStream()
            .mapToLong(Long::valueOf)
            .sum();
        long parallelTime = System.currentTimeMillis() - startTime;

        System.out.println("串行处理时间: " + sequentialTime + "ms");
        System.out.println("并行处理时间: " + parallelTime + "ms");
    }
}
```

### 3.3 循环优化

#### 3.3.1 避免在循环中重复计算

```java
public class LoopOptimization {
    // 不好的做法
    public void badLoop() {
        List<String> list = new ArrayList<>();
        for (int i = 0; i < 1000000; i++) {
            list.add("Item " + i);
        }

        for (int i = 0; i < list.size(); i++) {  // 每次都调用size()
            System.out.println(list.get(i));
        }
    }

    // 好的做法
    public void goodLoop() {
        List<String> list = new ArrayList<>();
        for (int i = 0; i < 1000000; i++) {
            list.add("Item " + i);
        }

        int size = list.size();  // 缓存size()结果
        for (int i = 0; i < size; i++) {
            System.out.println(list.get(i));
        }
    }

    // 使用增强for循环
    public void enhancedForLoop() {
        List<String> list = Arrays.asList("A", "B", "C", "D");
        for (String item : list) {  // 性能更好，代码更简洁
            System.out.println(item);
        }
    }
}
```

#### 3.3.2 避免装箱拆箱操作

```java
public class BoxingOptimization {
    // 避免不必要的装箱
    public void avoidBoxing() {
        // 不好的做法
        List<Integer> badList = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            badList.add(i);  // 自动装箱
        }

        // 好的做法 - 使用基本类型数组
        int[] goodArray = new int[1000];
        for (int i = 0; i < 1000; i++) {
            goodArray[i] = i;  // 不涉及装箱
        }

        // 或者使用专门的基本类型集合库
        // 如Trove、Eclipse Collections等
    }

    // 在数值计算中避免装箱
    public int sumWithPrimitives(int[] numbers) {
        int sum = 0;
        for (int num : numbers) {  // 基本类型，无装箱
            sum += num;
        }
        return sum;
    }

    public int sumWithObjects(Integer[] numbers) {
        int sum = 0;
        for (Integer num : numbers) {  // 拆箱操作
            sum += num;  // 自动拆箱
        }
        return sum;
    }
}
```

## 4. 内存管理优化

### 4.1 对象创建优化

#### 4.1.1 对象池模式

```java
import java.util.concurrent.ConcurrentLinkedQueue;

public class ObjectPool<T> {
    private final ConcurrentLinkedQueue<T> pool = new ConcurrentLinkedQueue<>();
    private final ObjectFactory<T> factory;

    public ObjectPool(ObjectFactory<T> factory) {
        this.factory = factory;
    }

    public T acquire() {
        T object = pool.poll();
        return object != null ? object : factory.createObject();
    }

    public void release(T object) {
        if (object != null) {
            // 重置对象状态
            factory.resetObject(object);
            pool.offer(object);
        }
    }

    @FunctionalInterface
    public interface ObjectFactory<T> {
        T createObject();
        default void resetObject(T object) {}
    }

    // 使用示例
    public static void main(String[] args) {
        ObjectPool<StringBuilder> sbPool = new ObjectPool<>(
            StringBuilder::new,
            sb -> sb.setLength(0)  // 重置StringBuilder
        );

        StringBuilder sb = sbPool.acquire();
        sb.append("Hello");
        System.out.println(sb.toString());

        sbPool.release(sb);  // 归还对象到池中
    }
}
```

#### 4.1.2 单例模式的内存优化

```java
// 懒加载单例，减少内存占用
public class LazySingleton {
    private static volatile LazySingleton instance;

    private LazySingleton() {
        // 私有构造函数
    }

    public static LazySingleton getInstance() {
        if (instance == null) {
            synchronized (LazySingleton.class) {
                if (instance == null) {
                    instance = new LazySingleton();
                }
            }
        }
        return instance;
    }
}

// 枚举单例 - 最安全的单例实现
public enum EnumSingleton {
    INSTANCE;

    public void doSomething() {
        System.out.println("执行操作");
    }
}
```

### 4.2 内存泄漏防范

#### 4.2.1 集合中的内存泄漏

```java
import java.lang.ref.WeakReference;
import java.util.*;

public class MemoryLeakPrevention {
    // 使用WeakHashMap避免内存泄漏
    public void weakHashMapExample() {
        Map<String, Object> strongMap = new HashMap<>();
        Map<String, Object> weakMap = new WeakHashMap<>();

        String key = new String("key");
        Object value = new Object();

        strongMap.put(key, value);
        weakMap.put(key, value);

        key = null;  // 移除强引用
        System.gc(); // 建议垃圾回收

        // strongMap中key的引用仍然存在
        System.out.println("Strong map size: " + strongMap.size());
        // weakMap中key会被回收
        System.out.println("Weak map size: " + weakMap.size());
    }

    // 避免持有不必要的对象引用
    public static class EventListener {
        private List<String> events = new ArrayList<>();

        public void onEvent(String event) {
            events.add(event);
        }

        // 定期清理不需要的事件
        public void cleanupOldEvents() {
            events.removeIf(event -> event.length() > 100); // 示例条件
        }
    }
}
```

#### 4.2.2 线程本地变量优化

```java
public class ThreadLocalOptimization {
    // 正确使用ThreadLocal
    private static final ThreadLocal<StringBuilder> LOCAL_BUILDER =
        ThreadLocal.withInitial(() -> new StringBuilder(256));

    public String buildString(String... parts) {
        StringBuilder sb = LOCAL_BUILDER.get();
        sb.setLength(0);  // 重置长度，但保留容量

        for (String part : parts) {
            sb.append(part);
        }

        return sb.toString();
    }

    // 使用后清理，防止内存泄漏
    public void cleanup() {
        LOCAL_BUILDER.remove();  // 重要：清理ThreadLocal
    }
}
```

## 5. 并发性能优化

### 5.1 无锁编程

#### 5.1.1 原子操作优化

```java
import java.util.concurrent.atomic.*;

public class AtomicOptimization {
    // 使用原子类避免锁竞争
    private final AtomicInteger counter = new AtomicInteger(0);
    private final AtomicReference<String> status = new AtomicReference<>("INIT");

    public void increment() {
        counter.incrementAndGet();  // 无锁原子操作
    }

    public boolean updateStatus(String expected, String newStatus) {
        return status.compareAndSet(expected, newStatus);
    }

    // 使用LongAdder提高高并发下的性能
    private final LongAdder highConcurrencyCounter = new LongAdder();

    public void highConcurrencyIncrement() {
        highConcurrencyCounter.increment();  // 高并发下性能更好
    }

    public long getHighConcurrencySum() {
        return highConcurrencyCounter.sum();
    }
}
```

#### 5.1.2 无锁队列

```java
import java.util.concurrent.ConcurrentLinkedQueue;

public class LockFreeQueueExample {
    private final ConcurrentLinkedQueue<String> queue = new ConcurrentLinkedQueue<>();

    public void producer() {
        for (int i = 0; i < 1000; i++) {
            queue.offer("Item-" + i);  // 无锁入队
        }
    }

    public void consumer() {
        String item;
        while ((item = queue.poll()) != null) {  // 无锁出队
            System.out.println("处理: " + item);
        }
    }
}
```

### 5.2 线程池优化

#### 5.2.1 合理配置线程池

```java
import java.util.concurrent.*;

public class ThreadPoolOptimization {
    // CPU密集型任务的线程池配置
    public ExecutorService createCpuIntensivePool() {
        int corePoolSize = Runtime.getRuntime().availableProcessors();
        return new ThreadPoolExecutor(
            corePoolSize,
            corePoolSize,
            60L, TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(100),
            new ThreadFactory() {
                private int counter = 0;
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, "CPU-Worker-" + counter++);
                    t.setDaemon(false);
                    return t;
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
    }

    // I/O密集型任务的线程池配置
    public ExecutorService createIoIntensivePool() {
        int corePoolSize = Runtime.getRuntime().availableProcessors() * 2;
        return new ThreadPoolExecutor(
            corePoolSize,
            corePoolSize * 2,
            120L, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(200),
            r -> new Thread(r, "IO-Worker"),
            new ThreadPoolExecutor.AbortPolicy()
        );
    }

    // 使用虚拟线程（Java 19+）
    public void virtualThreadExample() {
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 10000; i++) {
                final int taskId = i;
                executor.submit(() -> {
                    System.out.println("虚拟线程执行任务: " + taskId);
                    try {
                        Thread.sleep(1000);  // 模拟I/O操作
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                });
            }
        }
    }
}
```

## 6. 数据库访问优化

### 6.1 连接池配置

```java
// HikariCP连接池配置示例
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

public class DatabaseConnectionOptimization {
    public HikariDataSource createOptimizedDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
        config.setUsername("user");
        config.setPassword("password");

        // 连接池大小优化
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);

        // 连接超时设置
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);

        // 连接验证
        config.setConnectionTestQuery("SELECT 1");

        return new HikariDataSource(config);
    }
}
```

### 6.2 查询优化

```java
public class QueryOptimization {
    // 使用预编译语句防止SQL注入和提高性能
    public List<User> findUsersByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Collections.emptyList();
        }

        StringBuilder sql = new StringBuilder("SELECT * FROM users WHERE id IN (");
        for (int i = 0; i < ids.size(); i++) {
            if (i > 0) sql.append(",");
            sql.append("?");
        }
        sql.append(") ORDER BY id");

        try (PreparedStatement stmt = connection.prepareStatement(sql.toString())) {
            for (int i = 0; i < ids.size(); i++) {
                stmt.setLong(i + 1, ids.get(i));
            }

            ResultSet rs = stmt.executeQuery();
            List<User> users = new ArrayList<>();
            while (rs.next()) {
                users.add(mapResultSetToUser(rs));
            }
            return users;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    // 批量操作优化
    public void batchInsertUsers(List<User> users) {
        String sql = "INSERT INTO users (name, email, age) VALUES (?, ?, ?)";

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            for (User user : users) {
                stmt.setString(1, user.getName());
                stmt.setString(2, user.getEmail());
                stmt.setInt(3, user.getAge());
                stmt.addBatch();

                if (stmt.getUpdateCount() % 1000 == 0) {
                    stmt.executeBatch();
                }
            }
            stmt.executeBatch();  // 执行剩余的批处理
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
```

## 7. 缓存优化

### 7.1 本地缓存

```java
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

public class LocalCacheOptimization {
    private final Cache<String, User> userCache = Caffeine.newBuilder()
        .maximumSize(1000)                    // 最大缓存数量
        .expireAfterWrite(10, TimeUnit.MINUTES) // 写入后10分钟过期
        .expireAfterAccess(5, TimeUnit.MINUTES) // 访问后5分钟过期
        .recordStats()                        // 记录统计信息
        .build();

    public User getUser(String userId) {
        return userCache.get(userId, this::loadUserFromDatabase);
    }

    private User loadUserFromDatabase(String userId) {
        // 从数据库加载用户
        return databaseService.findUserById(userId);
    }

    // 批量缓存加载
    public Map<String, User> getUsers(Set<String> userIds) {
        Map<String, User> cachedUsers = userCache.getAllPresent(userIds);

        Set<String> missingIds = userIds.stream()
            .filter(id -> !cachedUsers.containsKey(id))
            .collect(Collectors.toSet());

        if (!missingIds.isEmpty()) {
            Map<String, User> loadedUsers = loadUsersFromDatabase(missingIds);
            userCache.putAll(loadedUsers);
            cachedUsers.putAll(loadedUsers);
        }

        return cachedUsers;
    }
}
```

### 7.2 分布式缓存

```java
// Redis缓存优化示例
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class RedisCacheOptimization {
    private final JedisPool jedisPool;

    public String getUserProfile(String userId) {
        try (Jedis jedis = jedisPool.getResource()) {
            String key = "user:profile:" + userId;
            String cached = jedis.get(key);

            if (cached != null) {
                return cached;
            }

            // 缓存未命中，从数据库加载
            String profile = loadProfileFromDatabase(userId);

            // 设置缓存，带过期时间
            jedis.setex(key, 3600, profile);  // 1小时过期

            return profile;
        }
    }

    // 使用Redis Pipeline提高批量操作性能
    public void batchUpdateUserStatus(List<UserStatusUpdate> updates) {
        try (Jedis jedis = jedisPool.getResource()) {
            Pipeline pipeline = jedis.pipelined();

            for (UserStatusUpdate update : updates) {
                String key = "user:status:" + update.getUserId();
                pipeline.setex(key, 86400, update.getStatus()); // 24小时过期
            }

            pipeline.sync();  // 执行所有操作
        }
    }
}
```

## 8. 性能监控和分析

### 8.1 应用性能监控

```java
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.Counter;

public class ApplicationMonitoring {
    private final MeterRegistry meterRegistry;
    private final Timer requestTimer;
    private final Counter errorCounter;

    public ApplicationMonitoring(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.requestTimer = Timer.builder("http.requests")
            .description("HTTP请求计时器")
            .register(meterRegistry);
        this.errorCounter = Counter.builder("http.errors")
            .description("HTTP错误计数器")
            .register(meterRegistry);
    }

    public String handleRequest(String request) {
        return requestTimer.recordCallable(() -> {
            try {
                // 处理请求逻辑
                return processRequest(request);
            } catch (Exception e) {
                errorCounter.increment();
                throw e;
            }
        });
    }

    private String processRequest(String request) {
        // 模拟请求处理
        try {
            Thread.sleep(100);  // 模拟处理时间
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "Response for: " + request;
    }
}
```

### 8.2 自定义性能指标

```java
public class CustomMetrics {
    // 业务指标监控
    private final AtomicLong totalProcessedItems = new AtomicLong(0);
    private final AtomicLong totalProcessingTime = new AtomicLong(0);

    public void recordProcessing(long items, long processingTimeMs) {
        totalProcessedItems.addAndGet(items);
        totalProcessingTime.addAndGet(processingTimeMs);
    }

    public double getAverageProcessingTime() {
        long count = totalProcessedItems.get();
        return count > 0 ? (double) totalProcessingTime.get() / count : 0.0;
    }

    public long getTotalProcessedItems() {
        return totalProcessedItems.get();
    }
}
```

## 9. 性能测试和基准测试

### 9.1 JMH基准测试

```java
import org.openjdk.jmh.annotations.*;
import java.util.concurrent.TimeUnit;

@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@State(Scope.Benchmark)
public class PerformanceBenchmark {
    private List<Integer> list = new ArrayList<>();
    private List<Integer> linkedList = new LinkedList<>();

    @Setup
    public void setup() {
        for (int i = 0; i < 1000; i++) {
            list.add(i);
            linkedList.add(i);
        }
    }

    @Benchmark
    public int arrayListRandomAccess() {
        return list.get(500);
    }

    @Benchmark
    public int linkedListRandomAccess() {
        return linkedList.get(500);
    }

    @Benchmark
    public void arrayListIteration() {
        for (int value : list) {
            // 消费value
        }
    }
}
```

## 10. 最佳实践总结

### 10.1 代码优化检查清单

1. **算法复杂度**：选择合适的数据结构和算法
2. **循环优化**：避免在循环中进行重复计算
3. **对象创建**：重用对象，避免频繁创建
4. **字符串操作**：使用StringBuilder进行拼接
5. **集合操作**：预设容量，选择合适的集合类型
6. **I/O操作**：使用缓冲，批量操作
7. **数据库访问**：使用连接池，优化查询语句
8. **并发控制**：合理使用线程池，避免过度同步

### 10.2 JVM调优建议

```bash
# 生产环境JVM参数示例
-server \
-Xms4g \
-Xmx4g \
-XX:NewRatio=1 \
-XX:SurvivorRatio=8 \
-XX:+UseG1GC \
-XX:MaxGCPauseMillis=200 \
-XX:+PrintGC \
-XX:+PrintGCDetails \
-XX:+PrintGCTimeStamps \
-Xloggc:gc.log \
-XX:+UseGCLogFileRotation \
-XX:NumberOfGCLogFiles=5 \
-XX:GCLogFileSize=10M
```

### 10.3 性能监控策略

1. **实时监控**：使用APM工具监控应用性能
2. **定期分析**：分析GC日志、堆转储文件
3. **压力测试**：定期进行性能压力测试
4. **容量规划**：根据业务增长预测资源需求
5. **持续优化**：建立性能优化的持续改进机制

## 总结

Java性能优化是一个系统工程，需要从多个维度考虑：

1. **语言特性**：充分利用Java的新特性提高开发效率和性能
2. **JVM调优**：合理配置JVM参数，优化垃圾回收
3. **代码优化**：编写高效的代码，避免常见性能陷阱
4. **架构优化**：使用缓存、连接池等技术优化系统架构
5. **监控分析**：建立完善的性能监控和分析体系

性能优化应该基于实际的性能测试数据，避免过早优化。在进行优化时，要平衡性能、可读性、可维护性等多个因素，选择最适合业务场景的优化策略。
