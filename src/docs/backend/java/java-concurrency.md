# Java并发编程详细指南

## 1. 并发编程概述

并发编程是指同时执行多个任务的编程方式。在现代多核处理器环境下，并发编程能够充分利用硬件资源，提高程序性能和响应性。

### 1.1 并发与并行的区别

- **并发（Concurrency）**：多个任务交替执行，宏观上看起来同时进行，微观上是分时执行
- **并行（Parallelism）**：多个任务真正同时执行，需要多核处理器支持

### 1.2 并发编程的优势

- 提高程序性能和吞吐量
- 改善用户体验和响应性
- 有效利用多核处理器资源
- 更好地处理I/O密集型任务

## 2. 线程基础

### 2.1 线程的概念

线程是程序执行的最小单位，一个进程可以包含多个线程，它们共享进程的内存空间。

### 2.2 创建线程的方式

#### 2.2.1 继承Thread类

```java
public class MyThread extends Thread {
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(Thread.currentThread().getName() + ": " + i);
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) {
        MyThread thread1 = new MyThread();
        MyThread thread2 = new MyThread();

        thread1.start();  // 启动线程
        thread2.start();
    }
}
```

#### 2.2.2 实现Runnable接口

```java
public class MyRunnable implements Runnable {
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(Thread.currentThread().getName() + ": " + i);
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) {
        Thread thread1 = new Thread(new MyRunnable(), "Thread-1");
        Thread thread2 = new Thread(new MyRunnable(), "Thread-2");

        thread1.start();
        thread2.start();
    }
}
```

#### 2.2.3 使用Callable和Future

```java
import java.util.concurrent.*;

public class MyCallable implements Callable<String> {
    private String taskName;

    public MyCallable(String taskName) {
        this.taskName = taskName;
    }

    @Override
    public String call() throws Exception {
        Thread.sleep(2000);
        return "任务 " + taskName + " 完成，结果: " + System.currentTimeMillis();
    }

    public static void main(String[] args) {
        ExecutorService executor = Executors.newFixedThreadPool(2);

        Future<String> future1 = executor.submit(new MyCallable("A"));
        Future<String> future2 = executor.submit(new MyCallable("B"));

        try {
            System.out.println(future1.get());  // 阻塞等待结果
            System.out.println(future2.get());
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }

        executor.shutdown();
    }
}
```

### 2.3 线程的状态

Java线程有以下6种状态：

- **NEW**：新建状态，线程被创建但未启动
- **RUNNABLE**：就绪和运行状态
- **BLOCKED**：阻塞状态
- **WAITING**：无限等待状态
- **TIMED_WAITING**：有限等待状态
- **TERMINATED**：终止状态

### 2.4 线程的生命周期

```java
public class ThreadLifecycle {
    public static void main(String[] args) {
        Thread thread = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                System.out.println("执行任务: " + i);
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    System.out.println("线程被中断");
                    return;
                }
            }
        });

        System.out.println("线程状态: " + thread.getState());  // NEW

        thread.start();
        System.out.println("线程状态: " + thread.getState());  // RUNNABLE

        try {
            thread.join();  // 等待线程执行完毕
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("线程状态: " + thread.getState());  // TERMINATED
    }
}
```

## 3. 线程同步

### 3.1 竞态条件和临界区

当多个线程同时访问共享资源时，可能会出现竞态条件（Race Condition），导致数据不一致。

```java
public class RaceConditionExample {
    private static int counter = 0;

    public static void main(String[] args) throws InterruptedException {
        Thread thread1 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                counter++;  // 临界区
            }
        });

        Thread thread2 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                counter++;  // 临界区
            }
        });

        thread1.start();
        thread2.start();

        thread1.join();
        thread2.join();

        System.out.println("预期结果: 20000, 实际结果: " + counter);
        // 实际结果可能不是20000，因为存在竞态条件
    }
}
```

### 3.2 synchronized关键字

#### 3.2.1 同步方法

```java
public class SynchronizedMethodExample {
    private static int counter = 0;

    public synchronized static void increment() {
        counter++;
    }

    public static void main(String[] args) throws InterruptedException {
        Thread thread1 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                increment();
            }
        });

        Thread thread2 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                increment();
            }
        });

        thread1.start();
        thread2.start();

        thread1.join();
        thread2.join();

        System.out.println("Counter: " + counter);  // 结果总是20000
    }
}
```

#### 3.2.2 同步代码块

```java
public class SynchronizedBlockExample {
    private static int counter = 0;
    private static final Object lock = new Object();

    public static void main(String[] args) throws InterruptedException {
        Thread thread1 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                synchronized (lock) {
                    counter++;
                }
            }
        });

        Thread thread2 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                synchronized (lock) {
                    counter++;
                }
            }
        });

        thread1.start();
        thread2.start();

        thread1.join();
        thread2.join();

        System.out.println("Counter: " + counter);  // 结果总是20000
    }
}
```

### 3.3 volatile关键字

volatile关键字确保变量的可见性和有序性，但不保证原子性。

```java
public class VolatileExample {
    private volatile boolean flag = false;

    public void writer() {
        flag = true;  // volatile写
    }

    public void reader() {
        if (flag) {   // volatile读
            System.out.println("Flag is true");
        }
    }

    public static void main(String[] args) {
        VolatileExample example = new VolatileExample();

        Thread writer = new Thread(() -> {
            try {
                Thread.sleep(1000);
                example.writer();
                System.out.println("Flag已设置为true");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        Thread reader = new Thread(() -> {
            while (!example.flag) {
                // 等待flag变为true
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            System.out.println("检测到flag为true");
        });

        reader.start();
        writer.start();
    }
}
```

## 4. Lock接口和ReentrantLock

### 4.1 ReentrantLock基础用法

```java
import java.util.concurrent.locks.ReentrantLock;

public class ReentrantLockExample {
    private static int counter = 0;
    private static final ReentrantLock lock = new ReentrantLock();

    public static void main(String[] args) throws InterruptedException {
        Thread thread1 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                lock.lock();
                try {
                    counter++;
                } finally {
                    lock.unlock();  // 必须在finally块中释放锁
                }
            }
        });

        Thread thread2 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                lock.lock();
                try {
                    counter++;
                } finally {
                    lock.unlock();
                }
            }
        });

        thread1.start();
        thread2.start();

        thread1.join();
        thread2.join();

        System.out.println("Counter: " + counter);  // 结果总是20000
    }
}
```

### 4.2 ReentrantLock的高级特性

```java
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.TimeUnit;

public class AdvancedReentrantLockExample {
    private static final ReentrantLock lock = new ReentrantLock();

    public static void main(String[] args) {
        // 尝试获取锁
        Thread thread = new Thread(() -> {
            try {
                if (lock.tryLock(2, TimeUnit.SECONDS)) {
                    System.out.println("获取锁成功");
                    Thread.sleep(3000);  // 持有锁3秒
                    lock.unlock();
                } else {
                    System.out.println("获取锁失败");
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        lock.lock();  // 主线程先获取锁
        System.out.println("主线程获取锁");

        thread.start();

        try {
            Thread.sleep(1000);
            System.out.println("主线程释放锁");
            lock.unlock();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 4.3 ReadWriteLock

```java
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class ReadWriteLockExample {
    private static String data = "初始数据";
    private static final ReadWriteLock lock = new ReentrantReadWriteLock();

    public static void main(String[] args) {
        // 写线程
        Thread writer = new Thread(() -> {
            lock.writeLock().lock();
            try {
                System.out.println("写线程开始写入");
                data = "更新的数据: " + System.currentTimeMillis();
                Thread.sleep(2000);
                System.out.println("写线程完成写入: " + data);
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                lock.writeLock().unlock();
            }
        });

        // 读线程
        Thread reader1 = new Thread(() -> {
            lock.readLock().lock();
            try {
                System.out.println("读线程1读取数据: " + data);
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                lock.readLock().unlock();
            }
        });

        Thread reader2 = new Thread(() -> {
            lock.readLock().lock();
            try {
                System.out.println("读线程2读取数据: " + data);
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                lock.readLock().unlock();
            }
        });

        writer.start();
        try { Thread.sleep(100); } catch (InterruptedException e) {}
        reader1.start();
        reader2.start();
    }
}
```

## 5. 线程间通信

### 5.1 wait/notify机制

```java
public class WaitNotifyExample {
    private static final Object lock = new Object();
    private static boolean dataReady = false;

    public static void main(String[] args) {
        Thread producer = new Thread(() -> {
            synchronized (lock) {
                System.out.println("生产者开始生产数据");
                try {
                    Thread.sleep(2000);  // 模拟生产时间
                    dataReady = true;
                    System.out.println("数据生产完成");
                    lock.notify();  // 唤醒等待的线程
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });

        Thread consumer = new Thread(() -> {
            synchronized (lock) {
                while (!dataReady) {
                    try {
                        System.out.println("消费者等待数据");
                        lock.wait();  // 等待生产者通知
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                System.out.println("消费者获取到数据: " + dataReady);
            }
        });

        consumer.start();
        producer.start();
    }
}
```

### 5.2 Condition接口

```java
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class ConditionExample {
    private static final ReentrantLock lock = new ReentrantLock();
    private static final Condition condition = lock.newCondition();
    private static boolean dataReady = false;

    public static void main(String[] args) {
        Thread producer = new Thread(() -> {
            lock.lock();
            try {
                System.out.println("生产者开始生产");
                Thread.sleep(2000);
                dataReady = true;
                System.out.println("生产完成，通知消费者");
                condition.signal();  // 唤醒等待的线程
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                lock.unlock();
            }
        });

        Thread consumer = new Thread(() -> {
            lock.lock();
            try {
                while (!dataReady) {
                    System.out.println("消费者等待数据");
                    condition.await();  // 等待生产者通知
                }
                System.out.println("消费者处理数据: " + dataReady);
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                lock.unlock();
            }
        });

        consumer.start();
        producer.start();
    }
}
```

## 6. 线程池

### 6.1 线程池基础概念

线程池是管理多个线程的容器，可以重复利用线程，减少创建和销毁线程的开销。

### 6.2 Executor框架

```java
import java.util.concurrent.*;

public class ExecutorExample {
    public static void main(String[] args) {
        // 创建固定大小的线程池
        ExecutorService executor = Executors.newFixedThreadPool(3);

        // 提交任务
        for (int i = 0; i < 5; i++) {
            final int taskId = i;
            executor.submit(() -> {
                System.out.println("任务 " + taskId + " 由线程 " +
                                 Thread.currentThread().getName() + " 执行");
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("任务 " + taskId + " 完成");
            });
        }

        // 关闭线程池
        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
        }
    }
}
```

### 6.3 线程池类型

#### 6.3.1 FixedThreadPool

```java
public class FixedThreadPoolExample {
    public static void main(String[] args) {
        ExecutorService fixedPool = Executors.newFixedThreadPool(2);

        for (int i = 0; i < 4; i++) {
            final int taskId = i;
            fixedPool.execute(() -> {
                System.out.println("执行任务 " + taskId +
                                 " 线程: " + Thread.currentThread().getName());
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        fixedPool.shutdown();
    }
}
```

#### 6.3.2 CachedThreadPool

```java
public class CachedThreadPoolExample {
    public static void main(String[] args) {
        ExecutorService cachedPool = Executors.newCachedThreadPool();

        for (int i = 0; i < 5; i++) {
            final int taskId = i;
            cachedPool.execute(() -> {
                System.out.println("任务 " + taskId + " 由线程 " +
                                 Thread.currentThread().getName() + " 执行");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        cachedPool.shutdown();
    }
}
```

#### 6.3.3 ScheduledThreadPool

```java
public class ScheduledThreadPoolExample {
    public static void main(String[] args) {
        ScheduledExecutorService scheduler =
            Executors.newScheduledThreadPool(2);

        // 延迟执行
        scheduler.schedule(() -> {
            System.out.println("延迟3秒执行: " +
                             Thread.currentThread().getName());
        }, 3, TimeUnit.SECONDS);

        // 固定频率执行
        scheduler.scheduleAtFixedRate(() -> {
            System.out.println("每2秒执行一次: " +
                             System.currentTimeMillis());
        }, 1, 2, TimeUnit.SECONDS);

        // 固定延迟执行
        scheduler.scheduleWithFixedDelay(() -> {
            System.out.println("执行任务，下次执行延迟1秒");
            try {
                Thread.sleep(500);  // 模拟任务执行时间
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, 0, 1, TimeUnit.SECONDS);

        // 5秒后关闭调度器
        scheduler.schedule(() -> {
            scheduler.shutdown();
            System.out.println("调度器已关闭");
        }, 10, TimeUnit.SECONDS);
    }
}
```

### 6.4 自定义线程池

```java
import java.util.concurrent.*;

public class CustomThreadPoolExample {
    public static void main(String[] args) {
        ThreadPoolExecutor customPool = new ThreadPoolExecutor(
            2,                      // 核心线程数
            4,                      // 最大线程数
            60L,                    // 空闲线程存活时间
            TimeUnit.SECONDS,       // 时间单位
            new LinkedBlockingQueue<>(10),  // 工作队列
            new ThreadFactory() {   // 线程工厂
                private int counter = 0;
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r, "CustomThread-" + counter++);
                    t.setDaemon(false);
                    return t;
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
        );

        // 提交任务
        for (int i = 0; i < 15; i++) {
            final int taskId = i;
            customPool.execute(() -> {
                System.out.println("任务 " + taskId + " 由线程 " +
                                 Thread.currentThread().getName() + " 执行");
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        customPool.shutdown();
    }
}
```

## 7. 并发集合

### 7.1 ConcurrentHashMap

```java
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ConcurrentHashMapExample {
    public static void main(String[] args) {
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();

        ExecutorService executor = Executors.newFixedThreadPool(3);

        // 多线程写入
        for (int i = 0; i < 3; i++) {
            final int threadNum = i;
            executor.submit(() -> {
                for (int j = 0; j < 10; j++) {
                    String key = "Key-" + threadNum + "-" + j;
                    map.put(key, threadNum * 10 + j);
                    System.out.println("线程 " + threadNum + " 添加: " + key);
                }
            });
        }

        // 多线程读取
        executor.submit(() -> {
            map.forEach((key, value) -> {
                System.out.println("读取: " + key + " = " + value);
            });
        });

        executor.shutdown();
    }
}
```

### 7.2 BlockingQueue

```java
import java.util.concurrent.*;

public class BlockingQueueExample {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<String> queue = new LinkedBlockingQueue<>(5);

        // 生产者线程
        Thread producer = new Thread(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    String item = "Item-" + i;
                    queue.put(item);  // 如果队列满，会阻塞
                    System.out.println("生产: " + item);
                    Thread.sleep(500);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        // 消费者线程
        Thread consumer = new Thread(() -> {
            try {
                while (true) {
                    String item = queue.take();  // 如果队列空，会阻塞
                    System.out.println("消费: " + item);
                    Thread.sleep(800);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        producer.start();
        consumer.start();

        Thread.sleep(8000);  // 运行8秒后停止
        System.exit(0);
    }
}
```

### 7.3 CopyOnWriteArrayList

```java
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class CopyOnWriteArrayListExample {
    public static void main(String[] args) throws InterruptedException {
        List<String> list = new CopyOnWriteArrayList<>();
        list.add("Initial");

        // 读线程
        Thread reader = new Thread(() -> {
            for (int i = 0; i < 100; i++) {
                // 读取操作不会阻塞
                for (String item : list) {
                    System.out.print(item + " ");
                }
                System.out.println();
                try {
                    Thread.sleep(10);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });

        // 写线程
        Thread writer = new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                list.add("Item-" + i);
                System.out.println("添加Item-" + i);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });

        reader.start();
        writer.start();

        reader.join();
        writer.join();

        System.out.println("最终列表: " + list);
    }
}
```

## 8. 原子类

### 8.1 基本原子类

```java
import java.util.concurrent.atomic.*;

public class AtomicExample {
    private static AtomicInteger atomicCounter = new AtomicInteger(0);
    private static AtomicLong atomicLong = new AtomicLong(0);
    private static AtomicBoolean atomicBoolean = new AtomicBoolean(false);

    public static void main(String[] args) throws InterruptedException {
        Thread[] threads = new Thread[10];

        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    atomicCounter.incrementAndGet();  // 原子递增
                    atomicLong.addAndGet(1);           // 原子加法
                }
            });
        }

        for (Thread t : threads) {
            t.start();
        }

        for (Thread t : threads) {
            t.join();
        }

        System.out.println("AtomicInteger结果: " + atomicCounter.get());
        System.out.println("AtomicLong结果: " + atomicLong.get());

        // 原子布尔操作
        atomicBoolean.compareAndSet(false, true);
        System.out.println("AtomicBoolean结果: " + atomicBoolean.get());
    }
}
```

### 8.2 原子引用

```java
import java.util.concurrent.atomic.AtomicReference;

public class AtomicReferenceExample {
    static class Person {
        private String name;
        private int age;

        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }

        @Override
        public String toString() {
            return "Person{name='" + name + "', age=" + age + "}";
        }
    }

    public static void main(String[] args) {
        AtomicReference<Person> atomicPerson = new AtomicReference<>();
        atomicPerson.set(new Person("张三", 25));

        System.out.println("初始值: " + atomicPerson.get());

        // 原子更新
        boolean updated = atomicPerson.compareAndSet(
            atomicPerson.get(),
            new Person("李四", 30)
        );

        System.out.println("更新结果: " + updated);
        System.out.println("更新后: " + atomicPerson.get());
    }
}
```

## 9. 并发工具类

### 9.1 CountDownLatch

```java
import java.util.concurrent.CountDownLatch;

public class CountDownLatchExample {
    public static void main(String[] args) throws InterruptedException {
        int threadCount = 3;
        CountDownLatch latch = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            final int threadNum = i;
            new Thread(() -> {
                try {
                    System.out.println("线程 " + threadNum + " 开始工作");
                    Thread.sleep((long) (Math.random() * 5000));  // 模拟工作
                    System.out.println("线程 " + threadNum + " 工作完成");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    latch.countDown();  // 计数器减1
                }
            }).start();
        }

        System.out.println("等待所有线程完成...");
        latch.await();  // 等待计数器变为0
        System.out.println("所有线程已完成，主线程继续执行");
    }
}
```

### 9.2 CyclicBarrier

```java
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;

public class CyclicBarrierExample {
    public static void main(String[] args) {
        int threadCount = 3;
        CyclicBarrier barrier = new CyclicBarrier(threadCount, () -> {
            System.out.println("所有线程已到达屏障，开始下一阶段");
        });

        for (int i = 0; i < threadCount; i++) {
            final int threadNum = i;
            new Thread(() -> {
                try {
                    System.out.println("线程 " + threadNum + " 准备就绪");
                    Thread.sleep((long) (Math.random() * 3000));

                    System.out.println("线程 " + threadNum + " 到达屏障");
                    barrier.await();  // 等待其他线程

                    System.out.println("线程 " + threadNum + " 继续执行");
                    Thread.sleep(1000);

                    // 再次使用屏障
                    System.out.println("线程 " + threadNum + " 第二阶段准备就绪");
                    barrier.await();

                    System.out.println("线程 " + threadNum + " 完成所有任务");
                } catch (InterruptedException | BrokenBarrierException e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }
}
```

### 9.3 Semaphore

```java
import java.util.concurrent.Semaphore;

public class SemaphoreExample {
    public static void main(String[] args) {
        // 创建信号量，允许同时3个线程访问
        Semaphore semaphore = new Semaphore(3);

        for (int i = 0; i < 8; i++) {
            final int threadNum = i;
            new Thread(() -> {
                try {
                    System.out.println("线程 " + threadNum + " 等待获取许可");
                    semaphore.acquire();  // 获取许可
                    System.out.println("线程 " + threadNum + " 获取许可，开始执行");

                    Thread.sleep(2000);  // 模拟工作

                    System.out.println("线程 " + threadNum + " 完成工作，释放许可");
                    semaphore.release();  // 释放许可
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }
}
```

## 10. CompletableFuture

### 10.1 CompletableFuture基础用法

```java
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

public class CompletableFutureExample {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        // 创建异步任务
        CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(2000);
                return "异步任务结果: " + System.currentTimeMillis();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return "错误";
            }
        });

        // 处理结果
        CompletableFuture<String> result = future.thenApply(data -> {
            return "处理后的数据: " + data;
        });

        System.out.println("等待结果...");
        System.out.println(result.get());  // 阻塞等待结果
    }
}
```

### 10.2 组合多个异步任务

```java
public class CompletableFutureComposition {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        // 串行执行
        CompletableFuture<String> combined = CompletableFuture
            .supplyAsync(() -> {
                try {
                    Thread.sleep(1000);
                    return "第一步结果";
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return "错误";
                }
            })
            .thenApply(result -> result + " -> 第二步处理")
            .thenApply(result -> result + " -> 第三步处理");

        // 并行执行
        CompletableFuture<String> task1 = CompletableFuture
            .supplyAsync(() -> "任务1结果");

        CompletableFuture<String> task2 = CompletableFuture
            .supplyAsync(() -> "任务2结果");

        // 等待两个任务都完成
        CompletableFuture<Void> allDone = CompletableFuture
            .allOf(task1, task2);

        allDone.thenRun(() -> {
            try {
                System.out.println("任务1: " + task1.get());
                System.out.println("任务2: " + task2.get());
            } catch (InterruptedException | ExecutionException e) {
                e.printStackTrace();
            }
        }).get();

        System.out.println("组合结果: " + combined.get());
    }
}
```

## 11. Fork/Join框架

### 11.1 Fork/Join基础

```java
import java.util.concurrent.RecursiveTask;
import java.util.concurrent.ForkJoinPool;

public class ForkJoinExample {
    // 计算数组和的递归任务
    static class SumTask extends RecursiveTask<Long> {
        private final long[] array;
        private final int start;
        private final int end;
        private static final int THRESHOLD = 1000;  // 阈值

        public SumTask(long[] array, int start, int end) {
            this.array = array;
            this.start = start;
            this.end = end;
        }

        @Override
        protected Long compute() {
            if (end - start <= THRESHOLD) {
                // 小于阈值，直接计算
                long sum = 0;
                for (int i = start; i < end; i++) {
                    sum += array[i];
                }
                return sum;
            } else {
                // 大于阈值，分解任务
                int mid = (start + end) / 2;
                SumTask leftTask = new SumTask(array, start, mid);
                SumTask rightTask = new SumTask(array, mid, end);

                // 执行子任务
                leftTask.fork();
                rightTask.fork();

                // 合并结果
                long leftResult = leftTask.join();
                long rightResult = rightTask.join();

                return leftResult + rightResult;
            }
        }
    }

    public static void main(String[] args) {
        // 创建大数组
        long[] array = new long[10000000];
        for (int i = 0; i < array.length; i++) {
            array[i] = i + 1;
        }

        ForkJoinPool pool = new ForkJoinPool();
        SumTask task = new SumTask(array, 0, array.length);

        long startTime = System.currentTimeMillis();
        long result = pool.invoke(task);
        long endTime = System.currentTimeMillis();

        System.out.println("计算结果: " + result);
        System.out.println("计算时间: " + (endTime - startTime) + "ms");

        pool.shutdown();
    }
}
```

## 12. 并发最佳实践

### 12.1 线程安全的单例模式

```java
// 双重检查锁定模式
public class ThreadSafeSingleton {
    private static volatile ThreadSafeSingleton instance;

    private ThreadSafeSingleton() {}

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

// 枚举单例（推荐）
public enum EnumSingleton {
    INSTANCE;

    public void doSomething() {
        System.out.println("执行操作");
    }
}
```

### 12.2 避免死锁

```java
public class DeadlockAvoidance {
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();

    public void method1() {
        synchronized (lock1) {
            System.out.println("方法1获取lock1");
            try { Thread.sleep(100); } catch (InterruptedException e) {}

            synchronized (lock2) {
                System.out.println("方法1获取lock2");
            }
        }
    }

    public void method2() {
        // 为了避免死锁，使用相同的锁顺序
        synchronized (lock1) {  // 与method1相同的顺序
            System.out.println("方法2获取lock1");
            try { Thread.sleep(100); } catch (InterruptedException e) {}

            synchronized (lock2) {
                System.out.println("方法2获取lock2");
            }
        }
    }
}
```

### 12.3 线程池使用最佳实践

```java
import java.util.concurrent.*;

public class ThreadPoolBestPractices {
    public static void main(String[] args) {
        // 1. 根据任务类型选择合适的线程池
        // CPU密集型任务：线程数 = CPU核心数 + 1
        int cpuThreads = Runtime.getRuntime().availableProcessors() + 1;
        ExecutorService cpuIntensivePool =
            Executors.newFixedThreadPool(cpuThreads);

        // I/O密集型任务：可以使用更多线程
        ExecutorService ioIntensivePool =
            Executors.newFixedThreadPool(cpuThreads * 2);

        // 2. 合理设置队列大小
        ThreadPoolExecutor customPool = new ThreadPoolExecutor(
            2, 4, 60L, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(100),  // 有界队列
            new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
        );

        // 3. 正确关闭线程池
        customPool.shutdown();
        try {
            if (!customPool.awaitTermination(60, TimeUnit.SECONDS)) {
                customPool.shutdownNow();
                if (!customPool.awaitTermination(60, TimeUnit.SECONDS)) {
                    System.err.println("线程池未能正常关闭");
                }
            }
        } catch (InterruptedException e) {
            customPool.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
```

## 13. 性能监控和调试

### 13.1 线程监控

```java
public class ThreadMonitoring {
    public static void monitorThreads() {
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();

        System.out.println("线程总数: " + threadBean.getThreadCount());
        System.out.println("峰值线程数: " + threadBean.getPeakThreadCount());
        System.out.println("守护线程数: " + threadBean.getDaemonThreadCount());
        System.out.println("已启动线程总数: " + threadBean.getTotalStartedThreadCount());

        // 检测死锁
        long[] deadlockedThreads = threadBean.findDeadlockedThreads();
        if (deadlockedThreads != null) {
            System.out.println("发现死锁线程: " + deadlockedThreads.length);
        }
    }
}
```

### 13.2 并发测试

```java
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ConcurrencyTest {
    public static void stressTest() throws InterruptedException {
        int threadCount = 100;
        int operationsPerThread = 1000;
        CountDownLatch latch = new CountDownLatch(threadCount);

        ExecutorService executor = Executors.newFixedThreadPool(10);
        AtomicInteger counter = new AtomicInteger(0);

        long startTime = System.currentTimeMillis();

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                for (int j = 0; j < operationsPerThread; j++) {
                    counter.incrementAndGet();
                }
                latch.countDown();
            });
        }

        latch.await();
        long endTime = System.currentTimeMillis();

        System.out.println("总操作数: " + (threadCount * operationsPerThread));
        System.out.println("实际计数: " + counter.get());
        System.out.println("耗时: " + (endTime - startTime) + "ms");

        executor.shutdown();
    }
}
```

## 14. 常见并发问题和解决方案

### 14.1 可见性问题

```java
// 使用volatile解决可见性问题
public class VisibilityProblem {
    private volatile boolean flag = false;
    private int data = 0;

    public void writer() {
        data = 42;
        flag = true;  // volatile写，保证data的修改对其他线程可见
    }

    public void reader() {
        if (flag) {   // volatile读
            // 此时能保证看到data = 42
            System.out.println("Data: " + data);
        }
    }
}
```

### 14.2 原子性问题

```java
// 使用synchronized或原子类解决原子性问题
public class AtomicityProblem {
    private AtomicInteger atomicCounter = new AtomicInteger(0);
    private int normalCounter = 0;

    // 原子操作
    public void incrementAtomic() {
        atomicCounter.incrementAndGet();
    }

    // 同步方法保证原子性
    public synchronized void incrementSynchronized() {
        normalCounter++;
    }
}
```

## 总结

Java并发编程是一个复杂但重要的主题，涵盖了线程创建、同步机制、线程池、并发集合等多个方面。掌握并发编程的关键在于：

1. **理解基本概念**：线程、进程、同步、异步等基本概念
2. **选择合适的同步机制**：synchronized、Lock、原子类等
3. **合理使用线程池**：避免创建过多线程，提高资源利用率
4. **注意并发安全**：防止竞态条件、死锁等问题
5. **性能优化**：选择合适的并发工具，避免不必要的同步开销

在实际开发中，应该根据具体场景选择合适的并发编程方式，平衡性能、可读性和可维护性。
