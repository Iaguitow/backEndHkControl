# backEndHkControl
database serve for the HK control app.

Before clone this project, is necessary create a database in MySQL.

------SCRIPT-----

-- MySQL Workbench Synchronization
-- Generated: 2022-05-31 15:41
-- Model: New Model
-- Version: 1.0
-- Project: Name of the project
-- Author: vieir

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

ALTER TABLE `londonerhkcontrols`.`people` 
DROP FOREIGN KEY `fk_category`;

ALTER TABLE `londonerhkcontrols`.`tasks` 
DROP FOREIGN KEY `fk_tasks_idjobcategory`;

ALTER TABLE `londonerhkcontrols`.`people_has_tasks` 
DROP FOREIGN KEY `fk_tasks_has_idpeople`,
DROP FOREIGN KEY `fk_tasks_has_idtask`;

ALTER TABLE `londonerhkcontrols`.`requests` 
DROP FOREIGN KEY `fk_requests_idjobcategory`;

ALTER TABLE `londonerhkcontrols`.`people_has_requests` 
DROP FOREIGN KEY `fk_has_requests_idpeople`,
DROP FOREIGN KEY `fk_has_requests_idrequests`;

ALTER TABLE `londonerhkcontrols`.`people` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `londonerhkcontrols`.`jobcategory` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ,
CHANGE COLUMN `categorylevel` `categorylevel` CHAR(1) NULL DEFAULT NULL COMMENT 'categorylevel:\nP -> PORTER\nS -> SUPERVISOR\nM -> MANAGE\nPS -> PORTER SUPERVISOR' ;

ALTER TABLE `londonerhkcontrols`.`tasks` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `londonerhkcontrols`.`people_has_tasks` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `londonerhkcontrols`.`requests` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `londonerhkcontrols`.`people_has_requests` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `londonerhkcontrols`.`people` 
ADD CONSTRAINT `fk_category`
  FOREIGN KEY (`fk_idjobcategory`)
  REFERENCES `londonerhkcontrols`.`jobcategory` (`idjobcategory`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `londonerhkcontrols`.`tasks` 
ADD CONSTRAINT `fk_tasks_idjobcategory`
  FOREIGN KEY (`fk_jobcategory`)
  REFERENCES `londonerhkcontrols`.`jobcategory` (`idjobcategory`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `londonerhkcontrols`.`people_has_tasks` 
ADD CONSTRAINT `fk_tasks_has_idpeople`
  FOREIGN KEY (`fk_people`)
  REFERENCES `londonerhkcontrols`.`people` (`idpeople`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_tasks_has_idtask`
  FOREIGN KEY (`fk_tasks`)
  REFERENCES `londonerhkcontrols`.`tasks` (`idtasks`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `londonerhkcontrols`.`requests` 
ADD CONSTRAINT `fk_requests_idjobcategory`
  FOREIGN KEY (`fk_jobcategory`)
  REFERENCES `londonerhkcontrols`.`jobcategory` (`idjobcategory`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `londonerhkcontrols`.`people_has_requests` 
ADD CONSTRAINT `fk_has_requests_idpeople`
  FOREIGN KEY (`fk_people`)
  REFERENCES `londonerhkcontrols`.`people` (`idpeople`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_has_requests_idrequests`
  FOREIGN KEY (`fk_requests`)
  REFERENCES `londonerhkcontrols`.`requests` (`idrequests`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
