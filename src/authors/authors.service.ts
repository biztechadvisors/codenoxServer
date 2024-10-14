/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common'
import { UpdateAuthorDto } from './dto/update-author.dto'
import { Author } from './entities/author.entity'
import Fuse from 'fuse.js'
import { GetAuthorDto } from './dto/get-author.dto'
import { paginate } from '../common/pagination/paginate'
import { GetTopAuthorsDto } from './dto/get-top-authors.dto'
import { CreateAuthorDto } from './dto/create-author.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { convertToSlug } from 'src/helpers'
import { ShopSocials } from 'src/settings/entities/setting.entity'
import { Social } from 'src/users/entities/profile.entity'
import { Repository } from 'typeorm'
import { Attachment } from '../common/entities/attachment.entity'


const options = {
  keys: ['name', 'slug'],
  threshold: 0.3,
}

// const fuse = new Fuse(authors, options)

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
    @InjectRepository(ShopSocials)
    private shopSocialsRepository: Repository<ShopSocials>,
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
  ) { }


  async convertToSlug(text: any) {
    return await convertToSlug(text)
  }

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    try {

      const newAuthor = new Author()
      const socials: ShopSocials[] = [];

      if (createAuthorDto.socials) {

        for (const social of createAuthorDto.socials) {
          const newSocial = this.shopSocialsRepository.create(social)
          const socialId = await this.shopSocialsRepository.save(newSocial)
          socials.push(socialId);
        }
      }
      newAuthor.socials = socials
      newAuthor.id = createAuthorDto.id
      newAuthor.name = createAuthorDto.name
      newAuthor.slug = await this.convertToSlug(createAuthorDto.name);
      newAuthor.bio = createAuthorDto.bio
      newAuthor.born = createAuthorDto.born
      newAuthor.death = createAuthorDto.death
      newAuthor.translated_languages = createAuthorDto.translated_languages
      newAuthor.languages = createAuthorDto.languages
      newAuthor.quote = createAuthorDto.quote
      newAuthor.cover_image = createAuthorDto.cover_image
      newAuthor.image = createAuthorDto.image
      newAuthor.language = createAuthorDto.language
      newAuthor.translated_languages = createAuthorDto.translated_languages

      const AuthorId = await this.authorRepository.save(newAuthor)

      if (AuthorId.socials) {
        AuthorId.socials.map((social) => social.id);
      } else {
        console.log("AuthorId socials is undefined or null");
      }
      return newAuthor
    } catch (error) {
      console.log(error)
    }
  }

  async getAuthors({ page, limit, search, is_approved }: GetAuthorDto) {

    page = page || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let data: Author[] = await this.authorRepository.find({
      relations: ['socials']
    })

    const fuse = new Fuse(data, options)

    if (search) {
      const parseSearchParams = search.split(';')
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':')
        data = fuse.search(value)?.map(({ item }) => item)
      }
    }

    if (is_approved) {
      const approvedData = await this.authorRepository.find({
        where: { is_approved: true }
      })
      data = approvedData
    }


    const results = data.slice(startIndex, endIndex)
    const queryParams = [
      search ? `search=${encodeURIComponent(search)}` : '',
      `limit=${limit}`
    ]
      .filter(Boolean)
      .join('&');

    const url = `/authors?${queryParams}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    }
  }

  async getAuthorBySlug(slug: string): Promise<Author> {
    const findAuthor = await this.authorRepository.findOne({
      where: { slug: slug },
      relations: ['socials', 'image', 'cover_image']
    })
    return findAuthor
  }

  async getTopAuthors({ limit = 10 }: GetTopAuthorsDto): Promise<Author[]> {
    const topAuthors = await this.authorRepository.find({
      take: limit
    })
    return topAuthors
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto) {

    // if(id && updateAuthorDto){
    //   console.log("id update working")
    //   const author = await this.authorRepository.findOne({
    //     where: { id: id },
    //     relations: ['socials', 'image', 'cover_image']
    //   })

    //   if(author){

    //     //  if(updateAuthorDto){ 
    //         // author.is_approved = updateAuthorDto.is_approved ?? true
    //         author.bio = updateAuthorDto.bio
    //         author.quote = updateAuthorDto.quote
    //         author.born = updateAuthorDto.born
    //         author.death = updateAuthorDto.death
    //         author.language = updateAuthorDto.language
    //         author.languages = updateAuthorDto.languages
    //         author.name = updateAuthorDto.name
    //         author.slug = await this.convertToSlug(updateAuthorDto.name);
    //         author.translated_languages = updateAuthorDto.translated_languages

    //              // update socials
    //              if(updateAuthorDto.socials){

    //               const socials: ShopSocials[] = []

    //               for(const updateSocial of updateAuthorDto.socials){
    //                 const existingSocial = updateAuthorDto.socials.find(
    //                   (social) => social.icon === updateSocial.icon
    //                 );
    //                 if(existingSocial){
    //                    const final = this.shopSocialsRepository.create({ ...existingSocial, ...updateSocial})
    //                    const updatedSocial = await this.shopSocialsRepository.save(final)
    //                    socials.push(updatedSocial)
    //                 } else {
    //                   const newSocial = this.shopSocialsRepository.create({ ...updateSocial})
    //                   const savedSocial = await this.shopSocialsRepository.save(newSocial)
    //                   socials.push(savedSocial)
    //                 }
    //               }
    //               author.socials = socials
    //              } else {
    //               throw new NotFoundException("Invalid action Performed");
    //              }


    //              if(updateAuthorDto.image){

    //               console.log("updated images")
    //               try{
    //                  const updateLogo = await this.attachmentRepository.findOne({
    //                   where: {id: author.image.id }  
    //                  })
    //                  console.log("Logoooooo", updateLogo)
    //                  if(updateLogo){
    //                   const findAttachment = await this.attachmentRepository.findOne({
    //                     where: { original: updateLogo.original }
    //                   })
    //                   console.log("Attachmentssssssssss", findAttachment)

    //                   const del1 = await this.attachmentRepository.delete(findAttachment)
    //                     console.log("del1", del1)


    //                    const del2 = await this.attachmentRepository.delete(updateLogo)
    //                       console.log("del2", del2)

    //                    const updates = this.attachmentRepository.create(updateAuthorDto.image)
    //                    const savedLogo = await this.attachmentRepository.save(updates)
    //                    console.log("saveedLogoooo**************", savedLogo)
    //                 } else {
    //                   const updates = this.attachmentRepository.create(updateAuthorDto.image)
    //                   const createLogo = await this.attachmentRepository.save(updates)
    //                   console.log("createLogoooo**************", createLogo)
    //                 }


    //               } catch(error) {
    //                 console.error("Error saving logo:", error);
    //                 throw new NotFoundException("Invalid action Performed");
    //               }
    //             }

    //           console.log("updateFirst", author)
    //        const updatedAuthor  = await this.authorRepository.save(author)
    //        return updatedAuthor
    //   }
    // } 
    // else {
    const author = await this.authorRepository.findOne({
      where: { id: id },
      relations: ['socials', 'image', 'cover_image']
    })

    // Update author
    if (author) {

      author.is_approved = updateAuthorDto.is_approved ?? true
      if (updateAuthorDto) {
        // author.is_approved = updateAuthorDto.is_approved ?? true
        author.bio = updateAuthorDto.bio
        author.quote = updateAuthorDto.quote
        author.born = updateAuthorDto.born
        author.death = updateAuthorDto.death
        author.language = updateAuthorDto.language
        author.languages = updateAuthorDto.languages
        author.name = updateAuthorDto.name
        author.slug = await this.convertToSlug(updateAuthorDto.name);
        author.translated_languages = updateAuthorDto.translated_languages
      }
      if (updateAuthorDto.socials) {

        const socials: ShopSocials[] = []

        for (const updateSocial of updateAuthorDto.socials) {
          const existingSocial = updateAuthorDto.socials.find(
            (social) => social.icon === updateSocial.icon
          );
          if (existingSocial) {
            const final = this.shopSocialsRepository.create({ ...existingSocial, ...updateSocial })
            const updatedSocial = await this.shopSocialsRepository.save(final)
            socials.push(updatedSocial)
          } else {
            const newSocial = this.shopSocialsRepository.create({ ...updateSocial })
            const savedSocial = await this.shopSocialsRepository.save(newSocial)
            socials.push(savedSocial)
          }
        }
        author.socials = socials
      } else {
        throw new NotFoundException("Invalid action Performed");
      }
      if (updateAuthorDto.image) {


        try {
          const updateLogo = await this.attachmentRepository.findOne({
            where: { id: author.image.id }
          })

          if (updateLogo) {
            const findAttachment = await this.attachmentRepository.findOne({
              where: { original: updateLogo.original }
            })

            await this.attachmentRepository.delete(findAttachment)
            await this.attachmentRepository.delete(updateLogo)

            const updates = this.attachmentRepository.create(updateAuthorDto.image)
            await this.attachmentRepository.save(updates)

          } else {
            const updates = this.attachmentRepository.create(updateAuthorDto.image)
            await this.attachmentRepository.save(updates)

          }


        } catch (error) {
          console.error("Error saving logo:", error);
          throw new NotFoundException("Invalid action Performed");
        }
      }
      const updatedAuthor = await this.authorRepository.save(author)
      return updatedAuthor
    }
    // }

  }

  async remove(id: number) {

    try {
      const findId = await this.authorRepository.findOne({
        where: { id: id },
        relations: ['image', 'cover_image', 'socials']
      })

      if (findId) {

        await this.authorRepository.delete(findId.id)

        if (findId.cover_image) {
          const findCoverImageId = await this.attachmentRepository.findOne({
            where: { id: findId.cover_image.id }
          })

          await this.attachmentRepository.delete(findCoverImageId)

        }

        if (findId.image) {
          const findImageId = await this.attachmentRepository.findOne({
            where: { id: findId.image.id }
          })

          await this.attachmentRepository.delete(findImageId)

        }
        if (findId.socials) {
          for (const id of findId.socials) {

            const findSocialId = await this.shopSocialsRepository.findOne({
              where: { id: id.id }
            })


            await this.shopSocialsRepository.delete(findSocialId)

          }
        }

        return findId
      } else {
        const findIds = await this.shopSocialsRepository.find({
          where: { id: id }
        })
        return findIds
      }
    } catch (error) {
      throw new NotFoundException(error);
    }



  }
}
