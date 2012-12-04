SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

DROP SCHEMA IF EXISTS `apnrs` ;
CREATE SCHEMA IF NOT EXISTS `apnrs` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci ;
SHOW WARNINGS;
USE `apnrs` ;

-- -----------------------------------------------------
-- Table `apnrs`.`apnrs_devices`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `apnrs`.`apnrs_devices` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `apnrs`.`apnrs_devices` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `active` TINYINT(1) NOT NULL DEFAULT 1 ,
  `token` VARCHAR(64) NOT NULL ,
  `silentStartGMT` TIME NOT NULL ,
  `silentEndGMT` TIME NOT NULL ,
  `deviceBadge` TINYINT NOT NULL ,
  `lastRegisterDate` TIMESTAMP NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;

SHOW WARNINGS;
CREATE UNIQUE INDEX `id_UNIQUE` ON `apnrs`.`apnrs_devices` (`id` ASC) ;

SHOW WARNINGS;
CREATE UNIQUE INDEX `token_UNIQUE` ON `apnrs`.`apnrs_devices` (`token` ASC) ;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `apnrs`.`apnrs_tags`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `apnrs`.`apnrs_tags` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `apnrs`.`apnrs_tags` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `tag` VARCHAR(45) NOT NULL ,
  `createDate` TIMESTAMP NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;

SHOW WARNINGS;
CREATE UNIQUE INDEX `id_UNIQUE` ON `apnrs`.`apnrs_tags` (`id` ASC) ;

SHOW WARNINGS;
CREATE UNIQUE INDEX `tag_UNIQUE` ON `apnrs`.`apnrs_tags` (`tag` ASC) ;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `apnrs`.`apnrs_devices_tags`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `apnrs`.`apnrs_devices_tags` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `apnrs`.`apnrs_devices_tags` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `deviceID` INT NOT NULL ,
  `tagID` INT NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;

SHOW WARNINGS;
CREATE UNIQUE INDEX `id_UNIQUE` ON `apnrs`.`apnrs_devices_tags` (`id` ASC) ;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `apnrs`.`apnrs_devices_register`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `apnrs`.`apnrs_devices_register` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `apnrs`.`apnrs_devices_register` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `deviceID` INT NOT NULL ,
  `registering` TINYINT(1) NOT NULL ,
  `createDate` TIMESTAMP NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;

SHOW WARNINGS;
CREATE UNIQUE INDEX `id_UNIQUE` ON `apnrs`.`apnrs_devices_register` (`id` ASC) ;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `apnrs`.`apnrs_messages`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `apnrs`.`apnrs_messages` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `apnrs`.`apnrs_messages` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `msg_alert` TEXT NULL ,
  `msg_sound` VARCHAR(45) NULL ,
  `msg_badge` INT NULL ,
  `isBroadcasting` TINYINT(1) NOT NULL ,
  `tags` TEXT NULL ,
  `sentDate` TIMESTAMP NOT NULL ,
  `deviceToken` VARCHAR(64) NOT NULL ,
  `status` TEXT NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;

SHOW WARNINGS;
CREATE UNIQUE INDEX `id_UNIQUE` ON `apnrs`.`apnrs_messages` (`id` ASC) ;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `apnrs`.`apnrs_feedback`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `apnrs`.`apnrs_feedback` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `apnrs`.`apnrs_feedback` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `token` VARCHAR(64) NOT NULL ,
  `msgTimestamp` TIMESTAMP NOT NULL ,
  `createDate` TIMESTAMP NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;

SHOW WARNINGS;
CREATE UNIQUE INDEX `id_UNIQUE` ON `apnrs`.`apnrs_feedback` (`id` ASC) ;

SHOW WARNINGS;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
