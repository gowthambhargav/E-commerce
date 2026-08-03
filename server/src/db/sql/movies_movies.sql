CREATE DATABASE  IF NOT EXISTS `movies` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `movies`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: movies
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `movies`
--

DROP TABLE IF EXISTS `movies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `genre` varchar(100) DEFAULT NULL,
  `language` varchar(100) DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `rating` decimal(3,1) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movies`
--

LOCK TABLES `movies` WRITE;
/*!40000 ALTER TABLE `movies` DISABLE KEYS */;
INSERT INTO `movies` VALUES (1,'Leo','Action','Tamil','2h 44m',8.2,150.00,'https://upload.wikimedia.org/wikipedia/en/4/4f/Leo_%282023_Indian_film%29.jpg'),(2,'KGF Chapter 2','Action','Kannada','2h 48m',9.0,180.00,'https://upload.wikimedia.org/wikipedia/en/d/d7/K.G.F_Chapter_2.jpg'),(3,'RRR','Drama','Telugu','3h 2m',9.1,200.00,'https://upload.wikimedia.org/wikipedia/en/d/d7/RRR_Poster.jpg'),(4,'Jawan','Thriller','Hindi','2h 49m',8.5,170.00,'https://upload.wikimedia.org/wikipedia/en/3/39/Jawan_film_poster.jpg'),(5,'Michael','Action','Telugu','2h 25m',7.8,160.00,'https://upload.wikimedia.org/wikipedia/en/3/3b/Michael_film_poster.jpg'),(6,'Vikram','Thriller','Tamil','2h 54m',8.4,175.00,'https://upload.wikimedia.org/wikipedia/en/0/0c/Vikram_2022_poster.jpg'),(7,'Drishyam 2','Drama','Malayalam','2h 32m',8.7,190.00,'https://upload.wikimedia.org/wikipedia/en/e/ef/Drishyam_2_poster.jpg'),(8,'Kantara','Horror','Kannada','2h 30m',9.0,185.00,'https://upload.wikimedia.org/wikipedia/en/0/0a/Kantara_poster.jpg'),(9,'Brahmastra','Sci-Fi','Hindi','2h 42m',7.5,165.00,'https://upload.wikimedia.org/wikipedia/en/6/6d/Brahmastra_poster.jpg'),(10,'Sita Ramam','Romance','Telugu','2h 43m',8.8,195.00,'https://upload.wikimedia.org/wikipedia/en/6/6a/Sita_Ramam_poster.jpg');
/*!40000 ALTER TABLE `movies` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-03 18:39:22
